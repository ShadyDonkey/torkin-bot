import { index, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('routes/home/index.tsx'),
  route('legal/privacy', 'routes/legal/privacy.tsx'),
  route('legal/terms', 'routes/legal/terms.tsx'),

  route('admin', 'layouts/admin.tsx', [index('routes/admin/index.tsx')]),
] satisfies RouteConfig
