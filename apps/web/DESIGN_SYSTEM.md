# Design System Guide

All form controls in `components/ui.tsx`. Never copy-paste button/input classes.

## Quick Reference

### Button
```tsx
<Button variant="primary" size="md" loading={saving}>
  Save
</Button>
// Variants: primary, secondary, success, danger, ghost
// Sizes: sm, md, lg
```

### Input / Select / Textarea
```tsx
<Field label="Name" required>
  <Input placeholder="..." />
  <Select>
    <option>...</option>
  </Select>
  <Textarea rows={4} />
</Field>
```

### Layout
```tsx
<PageHeader title="Title" subtitle="..." action={<Button>+New</Button>} />
<Panel>Content</Panel>
<Modal open={open} onClose={...} title="..." footer={...}>Form</Modal>
```

### Feedback
```tsx
<Spinner />
<EmptyState icon="🎫" title="No data" />
<ErrorBanner message="Error text" />
<StatCard title="Title" value={42} icon="📊" />
```

### Colors & Labels
```tsx
import { STATUS_LABELS, PRIORITY_LABELS, StatusBadge, PriorityBadge } from '@/components/ui';

<StatusBadge status="OPEN" />
<PriorityBadge priority="URGENT" />
```

## API Calls
Always use `lib/api.ts`, never raw `fetch()`.

```tsx
import { api } from '@/lib/api';

const data = await api.get<Type>('/api/endpoint');
await api.post('/api/endpoint', payload);
await api.patch(`/api/endpoint/${id}`, updates);
await api.delete(`/api/endpoint/${id}`);
```

## Checklist for Pages
- [ ] Use Button, Input, Select, Field from ui.tsx
- [ ] Use api.get/post/patch/delete (never fetch)
- [ ] Dark mode: bg-slate-900, text-white, border-slate-700
- [ ] Handle errors with ErrorBanner
- [ ] Handle loading with Spinner
- [ ] Add StatusBadge/PriorityBadge with imported labels

