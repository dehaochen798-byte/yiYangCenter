# Module Structure

- `auth`: identity and login logic
- `customer`: customer, room, bed, meal, check-in/out, service focus
- `dashboard`: read-model style overview and summary endpoints
- `nursing`: care level, care item, care record
- `system`: system probes and lightweight diagnostics

Generated modules should follow:

- `src/modules/<scope>/<resource>/<resource>.module.ts`
- `src/modules/<scope>/<resource>/<resource>.controller.ts`
- `src/modules/<scope>/<resource>/<resource>.service.ts`
- `src/modules/<scope>/<resource>/dto/*.dto.ts`
