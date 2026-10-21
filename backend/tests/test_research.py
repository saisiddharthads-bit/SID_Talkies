from fastapi import status

def test_research_agent_execution_and_citations(client, test_user):
    headers = test_user["headers"]

    res = client.post("/api/v1/research/", headers=headers, json={
        "query": "Quantum Computing breakthroughs in 2026",
        "max_sources": 3
    })
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "summary" in data
    assert "key_findings" in data
    assert len(data["key_findings"]) > 0
    assert "sources" in data
    assert len(data["sources"]) > 0

    # Verify URLs exist and are valid URLs
    first_source = data["sources"][0]
    assert "url" in first_source
    assert first_source["url"].startswith("http")
    assert "title" in first_source

def test_research_task_history(client, test_user):
    headers = test_user["headers"]

    # List tasks
    res = client.get("/api/v1/research/tasks", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    assert isinstance(res.json(), list)
