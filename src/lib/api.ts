// Local API client for Django backend
const API_BASE_URL = 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth methods
  async getAuthStatus() {
    return this.request('/auth/status/');
  }

  async signIn(email: string, password: string) {
    return this.request('/auth/signin/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(email: string, password: string) {
    return this.request('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request('/auth/signout/', {
      method: 'POST',
    });
  }

  // Products
  async getProducts() {
    return this.request('/products/');
  }

  async createProduct(product: { name: string; price: number; description?: string }) {
    return this.request('/products/', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // Customers
  async getCustomers() {
    return this.request('/customers/');
  }

  async createCustomer(customer: { name: string; email?: string; phone?: string; address?: string }) {
    return this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  // Sales
  async getSales() {
    return this.request('/sales/');
  }

  async createSale(sale: {
    customer_name: string;
    issuer_name: string;
    sale_items: Array<{
      product_id?: string;
      product_name: string;
      quantity: number;
      price: number;
    }>;
  }) {
    return this.request('/sales/', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async getSale(id: string) {
    return this.request(`/sales/${id}/`);
  }

  async getSaleInvoiceData(id: string) {
    return this.request(`/sales/${id}/invoice_data/`);
  }

  async sendInvoiceEmail(id: string) {
    return this.request(`/sales/${id}/send_email/`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;