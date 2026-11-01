from httpx import AsyncClient


async def _create_project(client: AsyncClient, headers: dict) -> str:
    response = await client.post(
        "/api/v1/projects",
        headers=headers,
        json={"name": "Proyecto datasets", "description": "CSV reales"},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def test_dataset_upload_validates_and_registers_metadata(
    client: AsyncClient, admin_headers: dict, dataset_csv: bytes
):
    project_id = await _create_project(client, admin_headers)
    response = await client.post(
        f"/api/v1/projects/{project_id}/datasets/upload",
        headers=admin_headers,
        files={"file": ("clientes.csv", dataset_csv, "text/csv")},
        data={"name": "Clientes", "target_column": "abandono"},
    )
    assert response.status_code == 201, response.text
    dataset = response.json()
    assert dataset["verified"] is True
    assert dataset["target_column"] == "abandono"
    assert dataset["metadata_json"]["samples"] == 40
    assert dataset["metadata_json"]["task"] == "classification"
    assert len(dataset["checksum"]) == 64

    preview = await client.get(
        f"/api/v1/projects/{project_id}/datasets/{dataset['id']}/preview",
        headers=admin_headers,
    )
    assert preview.status_code == 200, preview.text
    body = preview.json()
    assert body["columns"] == ["edad", "ingreso", "visitas", "abandono"]
    assert body["total_rows"] == 40
    assert len(body["rows"]) == 10


async def test_dataset_without_explicit_headers_is_rejected(
    client: AsyncClient, admin_headers: dict, invalid_csv: bytes
):
    project_id = await _create_project(client, admin_headers)
    response = await client.post(
        f"/api/v1/projects/{project_id}/datasets/upload",
        headers=admin_headers,
        files={"file": ("invalido.csv", invalid_csv, "text/csv")},
    )
    assert response.status_code == 422
    assert "columnas" in response.text.lower()


async def test_non_csv_extension_is_rejected(client: AsyncClient, admin_headers: dict):
    project_id = await _create_project(client, admin_headers)
    response = await client.post(
        f"/api/v1/projects/{project_id}/datasets/upload",
        headers=admin_headers,
        files={"file": ("datos.txt", b"a,b\n1,2\n", "text/plain")},
    )
    assert response.status_code == 400


async def test_dataset_target_must_exist(client: AsyncClient, admin_headers: dict, dataset_csv: bytes):
    project_id = await _create_project(client, admin_headers)
    response = await client.post(
        f"/api/v1/projects/{project_id}/datasets/upload",
        headers=admin_headers,
        files={"file": ("clientes.csv", dataset_csv, "text/csv")},
        data={"target_column": "no_existe"},
    )
    assert response.status_code == 422
    assert "no_existe" in response.text


async def test_dataset_versions_increment_for_same_name(
    client: AsyncClient, admin_headers: dict, dataset_csv: bytes
):
    project_id = await _create_project(client, admin_headers)
    first = await client.post(
        f"/api/v1/projects/{project_id}/datasets/upload",
        headers=admin_headers,
        files={"file": ("clientes.csv", dataset_csv, "text/csv")},
        data={"name": "Clientes", "target_column": "abandono"},
    )
    second = await client.post(
        f"/api/v1/projects/{project_id}/datasets/upload",
        headers=admin_headers,
        files={"file": ("clientes.csv", dataset_csv, "text/csv")},
        data={"name": "Clientes", "target_column": "abandono"},
    )
    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["version"] == "v1.0"
    assert second.json()["version"] == "v1.1"
