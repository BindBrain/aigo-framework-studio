# AIGO Studio

AIGO Studio is the operational workspace for managing AI governance using the AIGO Framework.

It provides a self-hosted governance application for registering AI systems and managing governance activities across the AIGO lifecycle, including classification, evaluation, review, approval, validation, monitoring, reassessment, risk, controls, changes, incidents, evidence, rules, and assurance.

## AIGO Framework and AIGO Studio

AIGO Framework defines the governance model, concepts, structures, requirements, relationships, and guidance.

AIGO Studio provides the operational software for applying and managing that governance model in an organizational environment.

The Studio repository is intentionally separate from the Framework source repository.

## What Studio provides

* AI system registration and lifecycle management
* AI classification
* Governance evaluations
* Risk management and risk acceptance
* Control management
* Change management
* Incident management
* Governance reviews and approvals
* Validation and governance completeness checks
* Evidence management
* Governance rules
* Assurance records
* Governance dashboard and activity overview
* PostgreSQL persistence
* Docker-based self-hosted deployment

## Quick Start

### Requirements

* Docker Desktop
* Git

### Run with Docker Compose

```bash
git clone https://github.com/BindBrain/aigo-framework-studio.git
cd aigo-framework-studio
docker compose up -d --build
```

Then open Studio at:

http://localhost:3001

The API runs internally through the Studio web application and does not need to be opened directly.

For detailed Studio guidance, including what to enter on each governance page, see:

https://docs.aigoframework.com/docs/aigo-framework-studio

## Development

The application consists of:

* `apps/api/` — FastAPI backend
* `apps/web/` — Next.js frontend

The backend uses PostgreSQL, SQLAlchemy, Alembic, Pydantic, and FastAPI. The frontend uses Next.js, React, TypeScript, and Tailwind CSS.

## Governance positioning

AIGO Studio is a governance management and assurance-support platform.

It is not a certification body, accreditation body, conformity assessment body, or certification scheme.

Framework mappings and governance records support implementation, traceability, assessment, gap analysis, planning, controls, evidence, and assurance activities. They do not by themselves constitute certification or legal compliance determinations.

## Documentation

Framework documentation is maintained separately from this product repository.

Framework: https://aigoframework.com

Documentation: https://docs.aigoframework.com

Studio guidance: https://docs.aigoframework.com/docs/aigo-framework-studio

## Status

AIGO Studio v1 is an active product implementation of the AIGO governance lifecycle.

## License

AIGO Studio is released under the Apache License 2.0. See LICENSE.
