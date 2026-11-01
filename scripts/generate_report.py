import os
import sys
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page count
    along with corporate running headers and footers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # We only show running header on pages > 1 (skip cover/first page)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#374151"))
            self.drawString(42, 752, "NEUROLAB ENTERPRISE  •  REPORTE TÉCNICO DE DETALLE")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#6B7280"))
            self.drawRightString(570, 752, "SEMANA 11 • DEEP LEARNING ARCHITECTURE")
            
            self.setStrokeColor(colors.HexColor("#D1D5DB"))
            self.setLineWidth(0.6)
            self.line(42, 744, 570, 744)

        # Running Footer on all pages
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.6)
        self.line(42, 42, 570, 42)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#6B7280"))
        self.drawString(42, 30, "NeuroLab Enterprise System v1.0.0  •  Documentación Oficial de Plataforma  •  Confidencial")
        
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(570, 30, page_str)
        
        self.restoreState()


def build_pdf(output_path):
    # Page setup: letter size (612 x 792 pt), margins 42 pt (~0.58 in)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=42,
        rightMargin=42,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    C_PRIMARY = colors.HexColor("#0F172A")    # Deep Slate
    C_ACCENT = colors.HexColor("#1E293B")     # Dark Charcoal
    C_MUTED = colors.HexColor("#4B5563")      # Medium Slate
    C_LIGHT_BG = colors.HexColor("#F8FAFC")   # Frosted light background
    C_BORDER = colors.HexColor("#E2E8F0")     # Light Border
    C_EMERALD = colors.HexColor("#059669")    # Success Green
    C_CODE_BG = colors.HexColor("#F1F5F9")    # Inset code background

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=C_PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=C_MUTED,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=C_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=C_ACCENT,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=2
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1F2937")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=C_PRIMARY
    )

    badge_style = ParagraphStyle(
        'BadgeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9,
        textColor=C_PRIMARY
    )

    story = []

    # =========================================================================
    # PORTADA / HEADER PRINCIPAL
    # =========================================================================
    story.append(Paragraph("NeuroLab Enterprise", title_style))
    story.append(Paragraph("Plataforma Corporativa de Experimentación y Gestión de Redes Neuronales Artificiales", subtitle_style))
    
    # Metadata Badge Box
    meta_data = [
        [
            Paragraph("<b>Versión:</b> 1.0.0 Production", table_cell),
            Paragraph("<b>Materia:</b> Deep Learning (Semana 11)", table_cell),
            Paragraph("<b>Fecha:</b> 1 de Noviembre, 2026", table_cell)
        ],
        [
            Paragraph("<b>Repositorio:</b> github.com/sanhuezazetakevin-ship-it/NeuroLab_Enterprise", table_cell),
            Paragraph("<b>Rama Principal:</b> main", table_cell),
            Paragraph("<b>Estado de Sincronización:</b> Up to date", table_cell)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[200, 170, 158])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 0.75, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECCIÓN 1: RESUMEN EJECUTIVO Y OBJETIVOS ACADÉMICOS
    # =========================================================================
    story.append(Paragraph("1. Resumen Ejecutivo y Logros de la Semana 11", h1_style))
    story.append(Paragraph(
        "<b>NeuroLab Enterprise</b> es un ecosistema de software industrial diseñado para satisfacer tanto los requerimientos "
        "de producción de ingeniería de Inteligencia Artificial como los cuatro objetivos pedagógicos nucleares estipulados para la "
        "<b>Semana 11</b>. La aplicación centraliza el ciclo de vida completo de modelos neuronales: desde la formulación matemática "
        "del perceptrón y la selección de funciones de activación, hasta la construcción de grafos multicapa, entrenamiento asíncrono con telemetría en vivo, "
        "evaluación con métricas certificadas y gobernanza inmutable.",
        body_style
    ))

    # Objetivos Matrix
    obj_data = [
        [Paragraph("Objetivo de Aprendizaje (S11)", table_header), Paragraph("Implementación en NeuroLab Enterprise", table_header), Paragraph("Módulo Asociado", table_header)],
        [
            Paragraph("<b>1. Definir la Red Neuronal y su Importancia</b>", table_cell),
            Paragraph("Exposición analítica del paralelismo biológico-artificial, formulación matemática del modelo de McCulloch-Pitts / Rosenblatt, pesos sinápticos, sesgos y 5 funciones de activación simuladas en vivo.", table_cell),
            Paragraph("M03 Fundamentos", badge_style)
        ],
        [
            Paragraph("<b>2. Describir la Estructura de una Red</b>", table_cell),
            Paragraph("Constructor interactivo de topologías con separación estricta de Capas de Entrada, Ocultas y Salida. Validación dimensional y cálculo automático de parámetros entrenables en tiempo real.", table_cell),
            Paragraph("M04 Diseñador", badge_style)
        ],
        [
            Paragraph("<b>3. Identificar Tipos de Redes</b>", table_cell),
            Paragraph("Catálogo y templates dedicados para 4 familias arquitectónicas: Feedforward (FNN/MLP), Convolucionales (CNN), Recurrentes (RNN/LSTM/GRU) y Generativas Adversarias (GAN).", table_cell),
            Paragraph("M01 / M04", badge_style)
        ],
        [
            Paragraph("<b>4. Crear Redes con TensorFlow y Keras</b>", table_cell),
            Paragraph("Backend de compilación con Keras 3 / TensorFlow, worker de entrenamiento asíncrono con streaming de épocas por WebSocket, generación de curvas y registro inmutable en formato estándar (.keras).", table_cell),
            Paragraph("M06 / M08", badge_style)
        ]
    ]
    t_obj = Table(obj_data, colWidths=[150, 290, 88])
    t_obj.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_LIGHT_BG]),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_obj)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECCIÓN 2: ARQUITECTURA TÉCNICA DEL MONOREPOSITORIO
    # =========================================================================
    story.append(Paragraph("2. Arquitectura de Software y Componentes del Monorepo", h1_style))
    story.append(Paragraph(
        "El proyecto se encuentra estructurado bajo un monorepositorio modular, desacoplando responsabilidades de visualización, "
        "orquestación de APIs y cómputo pesado en workers distribuidos:",
        body_style
    ))

    arch_data = [
        [Paragraph("Capa / Directorio", table_header), Paragraph("Stack Tecnológico", table_header), Paragraph("Responsabilidad y Rol Operativo", table_header)],
        [
            Paragraph("<b>apps/web</b><br/>Frontend SPA", table_cell),
            Paragraph("React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons", table_cell),
            Paragraph("Interfaz empresarial con estética Apple VisionOS (Frosted Glass). Soporta Modo Claro y Modo Oscuro, simulación de Modo Demo y visualizaciones compactas ampliables.", table_cell)
        ],
        [
            Paragraph("<b>services/api</b><br/>API Gateway", table_cell),
            Paragraph("FastAPI, Pydantic v2, WebSockets, Python 3.11", table_cell),
            Paragraph("Exposición de endpoints REST para CRUD de proyectos, arquitecturas, datasets y streaming en tiempo real vía WebSocket / SSE de telemetría por época.", table_cell)
        ],
        [
            Paragraph("<b>workers/training</b><br/>Motor de Cómputo", table_cell),
            Paragraph("TensorFlow 2.16+, Keras 3, Redis Queue, NumPy", table_cell),
            Paragraph("Worker asíncrono desacoplado que consume tareas de entrenamiento de la cola Redis, construye el modelo Keras, entrena y emite telemetría epoch-by-epoch.", table_cell)
        ],
        [
            Paragraph("<b>infra</b><br/>Infraestructura Base", table_cell),
            Paragraph("PostgreSQL 16, Redis 7, MinIO (S3 Compatible), Docker", table_cell),
            Paragraph("Persistencia relacional de metadatos (Postgres), cola de mensajería (Redis) y Object Storage para pesos (.keras) y archivos CSV de datasets.", table_cell)
        ]
    ]
    t_arch = Table(arch_data, colWidths=[120, 168, 240])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_LIGHT_BG]),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECCIÓN 3: DETALLE DE LOS 10 MÓDULOS DEL SISTEMA
    # =========================================================================
    story.append(Paragraph("3. Desglose Exhaustivo de los 10 Módulos de la Plataforma", h1_style))
    story.append(Paragraph(
        "Cada módulo funcional implementa interfaces intuitivas, operaciones reactivas y controles corporativos de validación:",
        body_style
    ))

    modules_data = [
        [
            Paragraph("<b>M01 • Dashboard Corporativo</b>", table_cell_bold),
            Paragraph("Panel de control ejecutivo con KPIs en tiempo real: modelos en producción, tasa de acierto media (94.8%), trabajos de entrenamiento activos y utilización de GPU. Incluye dock lateral derecho con feed de actividad y accesos directos interactivos.", table_cell)
        ],
        [
            Paragraph("<b>M02 • Espacios de Trabajo & Proyectos</b>", table_cell_bold),
            Paragraph("Gestión aislada de proyectos (Multi-tenant) con trazabilidad de propietarios, descripción de objetivos, metadatos y conteo de arquitecturas y datasets asociados. Permite crear y cambiar de espacio de trabajo en un clic.", table_cell)
        ],
        [
            Paragraph("<b>M03 • Fundamentos & Simulador Neuronal</b>", table_cell_bold),
            Paragraph("Laboratorio interactivo de Deep Learning: comparativa biológica vs artificial, simulador de neurona individual calculando suma ponderada y activación en vivo, gráfica SVG reactiva de curvas (Sigmoide, ReLU, Leaky ReLU, Tanh, Softmax) y glosario técnico Semana 11.", table_cell)
        ],
        [
            Paragraph("<b>M04 • Diseñador Visual de Redes</b>", table_cell_bold),
            Paragraph("Constructor dinámico de capas (Input, Dense, Conv2D, Dropout, Flatten, LSTM). Permite ajustar unidades, funciones de activación e hiperparámetros del optimizador (Adam, SGD, RMSprop, Learning Rate). Incluye cálculo automático de tensores y parámetros.", table_cell)
        ],
        [
            Paragraph("<b>M05 • Datasets & Partición Determinista</b>", table_cell_bold),
            Paragraph("Gestor de datasets integrados a MinIO S3. Sliders interactivos para partición de datos en tiempo real (Train / Validation / Test) que totalizan automáticamente el 100%. Muestra tabular con inspección detallada de columnas independientes y vector objetivo (Target).", table_cell)
        ],
        [
            Paragraph("<b>M06 • Orquestador de Entrenamientos</b>", table_cell_bold),
            Paragraph("Monitor en vivo de trabajos de optimización. Visualiza el avance por época, tiempo transcurrido y curvas SVG en tiempo real de Pérdida (Loss / Val Loss) y Precisión (Accuracy / Val Accuracy) con terminal de logs en vivo.", table_cell)
        ],
        [
            Paragraph("<b>M07 • Evaluación & Benchmarks</b>", table_cell_bold),
            Paragraph("Análisis comparativo de experimentos contra benchmarks basales. Integra Matriz de Confusión interactiva, Curva ROC con discriminabilidad AUC, métricas macro/micro (Precision, Recall, F1) y dock derecho ampliable a pantalla completa.", table_cell)
        ],
        [
            Paragraph("<b>M08 • Registro de Modelos (Model Registry)</b>", table_cell_bold),
            Paragraph("Gobernanza y ciclo de vida formal de versiones: DRAFT -> REVIEWED -> APPROVED -> RETIRED. Cada versión cuenta con integridad criptográfica SHA-256 inmutable, resumen de métricas y descarga directa del artefacto compilado (.keras).", table_cell)
        ],
        [
            Paragraph("<b>M09 • Ficha Técnica & Auditoría (Model Cards)</b>", table_cell_bold),
            Paragraph("Generador de hojas de certificación oficial de modelos para despliegue en producción. Filtros de secciones (Topología, Métricas, Trazabilidad SHA-256) y exportación directa a formatos CSV, JSON estructurado e Impresión/PDF.", table_cell)
        ],
        [
            Paragraph("<b>M10 • Administración, Cuotas & RBAC</b>", table_cell_bold),
            Paragraph("Seguridad corporativa: Matriz RBAC para 5 roles (ADMIN, PROJECT_LEAD, AI_ENGINEER, REVIEWER, VIEWER), directorio de usuarios con invitación modal, control de cuotas de hardware (workers concurrentes, tiempo máximo, GPU/CUDA) y registro de auditoría inmutable.", table_cell)
        ],
    ]

    t_mod = Table(modules_data, colWidths=[165, 363])
    t_mod.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [C_LIGHT_BG, colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_mod)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECCIÓN 4: SIMULADOR DE MODO DEMO Y CASOS DE USO
    # =========================================================================
    story.append(Paragraph("4. Simulador de Modo Demo y Casos Industriales", h1_style))
    story.append(Paragraph(
        "Para facilitar presentaciones a clientes, evaluación de auditores y validación académica sin requerir hardware externo "
        "preconfigurado, NeuroLab Enterprise incluye un <b>Modo Demo Interactivo</b> con persistencia de estado y 3 escenarios reales:",
        body_style
    ))

    cases_data = [
        [Paragraph("Industria", table_header), Paragraph("Caso de Negocio", table_header), Paragraph("Arquitectura & Configuración", table_header), Paragraph("Dataset & Muestras", table_header)],
        [
            Paragraph("<b>Fintech</b>", table_cell_bold),
            Paragraph("Detección de Fraude Transaccional en Tarjetas de Crédito", table_cell),
            Paragraph("FNN / MLP Multicapa<br/>Input: 30 &bull; Dense 64 (ReLU) &bull; Dropout 0.3 &bull; Dense 32 (ReLU) &bull; Output Sigmoide", table_cell),
            Paragraph("creditcard_transactions_v2.csv<br/>10,000 muestras &bull; 30 features", table_cell)
        ],
        [
            Paragraph("<b>Salud</b>", table_cell_bold),
            Paragraph("Diagnóstico de Neumonía en Rayos X de Tórax", table_cell),
            Paragraph("CNN Convolucional Profunda<br/>Input: [224, 224, 3] &bull; Conv2D (32) &bull; Conv2D (64) &bull; Dense 128 &bull; Output 2 Softmax", table_cell),
            Paragraph("chest_xray_labeled.csv<br/>5,856 imágenes &bull; RGB", table_cell)
        ],
        [
            Paragraph("<b>Telecom</b>", table_cell_bold),
            Paragraph("Predicción Temprana de Fuga de Clientes (Churn)", table_cell),
            Paragraph("FNN / MLP Binario<br/>Input: 18 &bull; Dense 32 &bull; Dense 16 &bull; Output Sigmoide", table_cell),
            Paragraph("customer_churn_telco.csv<br/>7,043 clientes &bull; 18 variables", table_cell)
        ]
    ]
    t_cases = Table(cases_data, colWidths=[65, 145, 185, 133])
    t_cases.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_LIGHT_BG]),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_cases)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECCIÓN 5: DISEÑO VISUAL Y SISTEMA FROSTED GLASS
    # =========================================================================
    story.append(Paragraph("5. Sistema de Diseño Visual VisionOS & Frosted Glass", h1_style))
    story.append(Paragraph(
        "La interfaz del frontend sigue las directrices estéticas de <b>Apple VisionOS</b> con vidrio esmerilado translúcido "
        "y una paleta monocromática de grises de grado empresarial, optimizada para uso continuo:",
        body_style
    ))

    design_points = [
        [
            Paragraph("<b>Modo Oscuro (Smoked Glass)</b>", table_cell_bold),
            Paragraph("Fondo espacial carbón (#090a0d) con tarjetas de vidrio ahumado (rgba 20, 21, 26, 0.68), desenfoque de 28px, bordes de luz blanca difusa (10%) y tipografía blanca y gris claro de alto contraste.", table_cell)
        ],
        [
            Paragraph("<b>Modo Claro (Silvery Glass)</b>", table_cell_bold),
            Paragraph("Lienzo plateado luminoso (#e6e9ee) con tarjetas de vidrio cristalino (rgba 255, 255, 255, 0.75), sombras volumétricas sutiles y tipografía grafito oscuro (#0c0d11) con ratio de contraste WCAG AAA.", table_cell)
        ],
        [
            Paragraph("<b>Docks Laterales Plegables</b>", table_cell_bold),
            Paragraph("Los gráficos secundarios y métricas se alojan en un dock lateral derecho ultracompacto (1/3 del ancho) para maximizar el área de trabajo, expandiéndose a pantalla completa con modales interactivos al hacer clic.", table_cell)
        ],
        [
            Paragraph("<b>Gráficos Vectoriales Adaptativos</b>", table_cell_bold),
            Paragraph("Todas las curvas analíticas (ROC, función de coste, matrices de confusión) renderizan con trazos SVG dinámicos en currentColor, ajustando automáticamente su colorimetría según el tema seleccionado.", table_cell)
        ]
    ]
    t_design = Table(design_points, colWidths=[165, 363])
    t_design.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [C_LIGHT_BG, colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_design)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECCIÓN 6: GUÍA DE DESPLIEGUE Y COMANDOS DE EJECUCIÓN
    # =========================================================================
    story.append(Paragraph("6. Instrucciones de Despliegue y Ejecución", h1_style))
    story.append(Paragraph(
        "El proyecto está listo para su ejecución tanto en desarrollo local con hot-reload como en contenedores Docker de producción:",
        body_style
    ))

    cmd_data = [
        [Paragraph("Entorno / Tarea", table_header), Paragraph("Comando de Consola", table_header), Paragraph("Descripción y URLs de Acceso", table_header)],
        [
            Paragraph("<b>Frontend Web</b><br/>(React + Vite)", table_cell),
            Paragraph("cd apps/web<br/>npm install<br/>npm run dev", code_style),
            Paragraph("Inicia el servidor de desarrollo local en <b>http://localhost:5173</b> con hot-reload y compilación rápida.", table_cell)
        ],
        [
            Paragraph("<b>Verificación Build</b><br/>(TypeScript + Vite)", table_cell),
            Paragraph("cd apps/web<br/>npm run build", code_style),
            Paragraph("Ejecuta type-check estricto de TypeScript y genera el bundle de producción en <code>apps/web/dist</code> (0 errores).", table_cell)
        ],
        [
            Paragraph("<b>Backend API</b><br/>(FastAPI)", table_cell),
            Paragraph("cd services/api<br/>pip install -r requirements.txt<br/>uvicorn app.main:app --reload", code_style),
            Paragraph("Inicia la API REST y servidor WebSocket en <b>http://localhost:8000</b>. Documentación OpenAPI en <b>/docs</b>.", table_cell)
        ],
        [
            Paragraph("<b>Stack Completo</b><br/>(Docker Compose)", table_cell),
            Paragraph("docker-compose up -d", code_style),
            Paragraph("Levanta PostgreSQL 16 (puerto 5432), Redis 7 (puerto 6379), MinIO (puerto 9000/9001), API Gateway y Worker.", table_cell)
        ]
    ]
    t_cmd = Table(cmd_data, colWidths=[120, 190, 218])
    t_cmd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_LIGHT_BG]),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_cmd)
    story.append(Spacer(1, 16))

    # Sign-off box
    sign_box = [
        [
            Paragraph(
                "<b>Certificación de Entrega Técnica:</b> El presente documento formaliza el avance completo, diseño visual y "
                "especificaciones del monorepositorio NeuroLab Enterprise, alojado y sincronizado en la rama principal del repositorio:<br/>"
                "<b>URL:</b> https://github.com/sanhuezazetakevin-ship-it/NeuroLab_Enterprise.git",
                body_style
            )
        ]
    ]
    t_sign = Table(sign_box, colWidths=[528])
    t_sign.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, C_ACCENT),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_sign)

    # Build PDF with custom NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado con éxito en: {output_path}")

if __name__ == '__main__':
    desktop_dir = os.path.expanduser('~/Desktop')
    out_pdf = os.path.join(desktop_dir, 'NeuroLab_Enterprise_Reporte_Detallado.pdf')
    build_pdf(out_pdf)
