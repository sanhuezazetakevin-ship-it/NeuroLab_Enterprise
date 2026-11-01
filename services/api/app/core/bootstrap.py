import logging

from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.repositories.models import UserModel

logger = logging.getLogger("neurolab.bootstrap")


async def ensure_seed_admin() -> None:
    """Crea la cuenta inicial sólo si la tabla de usuarios está vacía.

    No restablece contraseñas ni crea usuarios adicionales: cambiar la clave
    inicial es responsabilidad operativa (ver docs/operations).
    """
    async with AsyncSessionLocal() as db:
        existing = await db.scalar(select(UserModel).limit(1))
        if existing:
            return
        admin = UserModel(
            email=settings.SEED_ADMIN_EMAIL.lower(),
            password_hash=get_password_hash(settings.SEED_ADMIN_PASSWORD),
            display_name=settings.SEED_ADMIN_NAME,
            role="ADMIN",
            status="ACTIVE",
        )
        db.add(admin)
        await db.commit()
        logger.warning(
            "Usuario administrador inicial creado: %s. Cambie la contraseña en el primer acceso.",
            admin.email,
        )
