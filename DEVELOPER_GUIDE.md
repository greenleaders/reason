# Developer Guide

This guide provides comprehensive information for developers working on the Social Media Management Platform.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Development Setup](#development-setup)
3. [Code Organization](#code-organization)
4. [Component Library](#component-library)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Styling Guidelines](#styling-guidelines)
8. [Testing](#testing)
9. [Performance Optimization](#performance-optimization)
10. [Deployment](#deployment)

## Project Structure

```
social-media-management-platform/
├── client/                     # React frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Basic UI components
│   │   │   ├── forms/        # Form components
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── services/         # API services
│   │   ├── contexts/         # React contexts
│   │   └── styles/           # Global styles
│   └── package.json
├── server/                    # Node.js backend
│   ├── routes/               # API routes
│   ├── middleware/           # Express middleware
│   ├── config/              # Configuration files
│   ├── database/            # Database schema and migrations
│   ├── scripts/             # Utility scripts
│   └── package.json
└── docs/                    # Documentation
```

## Development Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Git

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd social-media-management-platform

# Install dependencies
npm run install-all

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Set up database
createdb social_media_platform
cd server && npm run migrate && npm run seed

# Start development servers
npm run dev
```

### Environment Variables

**Server (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_media_platform
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
```

**Client (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Code Organization

### Component Structure

```jsx
// components/ComponentName.js
import React from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2, onAction }) => {
  // Component logic
  
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

ComponentName.defaultProps = {
  prop2: 0,
  onAction: () => {}
};

export default ComponentName;
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.js`)
- **Hooks**: camelCase starting with 'use' (e.g., `useLocalStorage.js`)
- **Utils**: camelCase (e.g., `formatDate.js`)
- **Pages**: PascalCase (e.g., `Dashboard.js`)
- **Services**: camelCase (e.g., `apiService.js`)

## Component Library

### UI Components

#### DataTable
```jsx
import DataTable from '../components/DataTable';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => <StatusBadge status={value} />
  }
];

<DataTable
  data={users}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  searchable={true}
  pagination={true}
/>
```

#### Modal
```jsx
import Modal from '../components/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Edit User"
  size="md"
>
  <UserForm onSubmit={handleSubmit} />
</Modal>
```

#### StatusBadge
```jsx
import StatusBadge from '../components/StatusBadge';

<StatusBadge 
  status="active" 
  type="campaign" 
  size="md" 
  showIcon={true} 
/>
```

### Form Components

#### SearchInput
```jsx
import SearchInput from '../components/SearchInput';

<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search campaigns..."
  debounceMs={300}
/>
```

#### FilterDropdown
```jsx
import FilterDropdown from '../components/FilterDropdown';

const options = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' }
];

<FilterDropdown
  options={options}
  value={selectedFilters}
  onChange={setSelectedFilters}
  multiple={true}
/>
```

### Layout Components

#### StatsCard
```jsx
import StatsCard from '../components/StatsCard';

<StatsCard
  title="Total Users"
  value={1250}
  change={12}
  changeType="positive"
  icon={Users}
  color="blue"
/>
```

## State Management

### React Query for Server State

```jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { campaignsAPI } from '../services/api';

// Fetch data
const { data, loading, error } = useQuery(
  'campaigns',
  campaignsAPI.getAll,
  { refetchOnWindowFocus: false }
);

// Mutate data
const queryClient = useQueryClient();
const mutation = useMutation(campaignsAPI.create, {
  onSuccess: () => {
    queryClient.invalidateQueries('campaigns');
  }
});
```

### Local State with Custom Hooks

```jsx
import { useLocalStorage } from '../hooks/useLocalStorage';

const [theme, setTheme] = useLocalStorage('theme', 'light');
const [preferences, setPreferences] = useLocalStorage('preferences', {});
```

### Context for Global State

```jsx
import { useAuth } from '../contexts/AuthContext';

const { user, login, logout } = useAuth();
```

## API Integration

### Service Layer

```jsx
// services/api.js
export const campaignsAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`)
};
```

### Error Handling

```jsx
import { useApi } from '../hooks/useApi';

const { data, loading, error, execute } = useApi(campaignsAPI.getAll);

if (error) {
  return <div>Error: {error}</div>;
}
```

## Styling Guidelines

### CSS Classes

Use the predefined utility classes:

```jsx
// Layout
<div className="flex items-center justify-between p-4">

// Cards
<div className="card">
  <div className="card-header">
    <h2 className="text-lg font-semibold">Title</h2>
  </div>
  <div className="card-body">
    Content
  </div>
</div>

// Buttons
<button className="btn btn-primary">Primary</button>
<button className="btn btn-outline">Outline</button>
<button className="btn btn-danger">Danger</button>

// Forms
<input className="form-input" />
<select className="form-input form-select" />
<textarea className="form-input form-textarea" />
```

### Responsive Design

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Dark Mode Support

```jsx
import { useThemeContext } from '../components/ThemeProvider';

const { theme, toggleTheme, isDark } = useThemeContext();

<div className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
  Content
</div>
```

## Testing

### Component Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

test('renders status badge correctly', () => {
  render(<StatusBadge status="active" type="campaign" />);
  expect(screen.getByText('Active')).toBeInTheDocument();
});
```

### API Testing

```jsx
import { campaignsAPI } from '../services/api';

test('fetches campaigns successfully', async () => {
  const mockData = [{ id: 1, title: 'Test Campaign' }];
  jest.spyOn(api, 'get').mockResolvedValue({ data: mockData });
  
  const result = await campaignsAPI.getAll();
  expect(result).toEqual(mockData);
});
```

## Performance Optimization

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('../pages/Dashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Memoization

```jsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  const handleAction = useCallback((id) => {
    onAction(id);
  }, [onAction]);

  return <div>{/* Component content */}</div>;
});
```

### Virtual Scrolling

```jsx
import VirtualList from '../components/VirtualList';

<VirtualList
  items={largeDataSet}
  itemHeight={50}
  containerHeight={400}
  renderItem={(item, index) => <ItemComponent item={item} />}
/>
```

## Deployment

### Build Process

```bash
# Build frontend
cd client
npm run build

# Build backend (if using Docker)
cd server
docker build -t social-media-api .
```

### Environment Configuration

```bash
# Production environment
NODE_ENV=production
DB_HOST=your-production-db-host
STRIPE_SECRET_KEY=sk_live_...
```

## Best Practices

### Code Quality

1. **Use TypeScript** for better type safety
2. **Follow ESLint rules** for consistent code style
3. **Write meaningful commit messages**
4. **Use meaningful variable and function names**
5. **Keep functions small and focused**

### Security

1. **Validate all inputs** on both client and server
2. **Use HTTPS** in production
3. **Implement proper authentication** and authorization
4. **Sanitize user inputs** to prevent XSS
5. **Use environment variables** for sensitive data

### Performance

1. **Optimize images** and use appropriate formats
2. **Implement lazy loading** for large datasets
3. **Use React.memo** for expensive components
4. **Minimize bundle size** with code splitting
5. **Implement caching** strategies

### Accessibility

1. **Use semantic HTML** elements
2. **Provide alt text** for images
3. **Ensure keyboard navigation** works
4. **Use ARIA labels** where appropriate
5. **Test with screen readers**

## Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database Connection:**
```bash
# Check PostgreSQL status
pg_ctl status
# Start PostgreSQL
pg_ctl start
```

**Port Conflicts:**
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

### Debugging

**React DevTools:** Install browser extension for component inspection
**Redux DevTools:** For state management debugging
**Network Tab:** Monitor API calls and responses
**Console Logs:** Use `console.log` strategically for debugging

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write tests** for new functionality
5. **Update documentation**
6. **Submit a pull request**

## Resources

- [React Documentation](https://reactjs.org/docs)
- [React Query Documentation](https://react-query.tanstack.com/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Documentation](https://stripe.com/docs)
