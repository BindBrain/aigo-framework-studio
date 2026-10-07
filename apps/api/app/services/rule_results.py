from app.schemas.rule_results import RuleResultsUpdate


_rule_results: dict[str, list[dict]] = {}


def save_rule_results(
    ai_system_id: str,
    data: RuleResultsUpdate,
) -> list[dict]:
    results = [result.model_dump() for result in data.results]
    _rule_results[ai_system_id] = results
    return results


def get_rule_results(ai_system_id: str) -> list[dict]:
    return _rule_results.get(ai_system_id, [])