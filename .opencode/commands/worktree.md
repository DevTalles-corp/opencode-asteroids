---
description: Crea un git worktree bajo .worktrees/ a partir del argumento
---

Crea un git worktree usando el argumento provisto como inspiración para el nombre.

Pasos:

1. Lee `$ARGUMENTS` (texto crudo del usuario tras /worktree; puede contener espacios).
2. Deriva un slug kebab-case estricto: sólo `[a-z0-9-]`, lowercase, sin underscores,
   sin espacios, sin barras, sin acentos. Analiza el contexto del argumento para
   elegir un nombre representativo (no printf literal).
3. Ejecuta ÚNICAMENTE:
   git worktree add ".worktrees/<slug>"
4. No cambies de directorio. No agregues pasos extra. No hagas commit, branch flags,
   ni nada adicional. Solo el comando de creación del worktree.
5. Si el argumento es muy largo simplifícalo a un nombre significativo.
