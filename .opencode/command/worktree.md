---
description: Crear un git worktree con un nombre derivado del contexto
---

1. Tomar el siguiente contexto y derivar un nombre corto y descriptivo en kebab-case (solo minúsculas, guiones, sin caracteres especiales). Si el contexto es muy largo, simplificarlo.

2. Ejecutar el siguiente comando con el nombre derivado:

```
git worktree add .worktrees/<nombre-derivado>
```

Contexto: $ARGUMENTS