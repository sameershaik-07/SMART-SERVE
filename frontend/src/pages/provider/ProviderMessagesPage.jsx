// Provider Messages Page
// The MessagesPage component is already role-aware (it reads user.role from AuthContext
// and adapts conversation labels accordingly). We simply re-use it here so it renders
// inside the ProviderLayout (dark sidebar) instead of CustomerLayout.

export { MessagesPage as ProviderMessagesPage } from '../customer/MessagesPage';
