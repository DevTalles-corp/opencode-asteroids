---
description: Eliminar un git worktree y sus ramas asociadas
---

1. Ejecutar `git worktree list` para encontrar el worktree que coincida con el contexto proporcionado.

2. Eliminar el worktree encontrado:

```
git worktree remove .worktrees/<nombre-del-worktree>
```

3. Para cada rama local única de ese worktree, eliminarla:

```
git branch -d <nombre-de-la-rama>
```

Contexto: $ARGUMENTS