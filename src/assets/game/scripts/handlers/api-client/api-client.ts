class ApiClient {
    private readonly baseUrl: string;

    constructor(baseURL: string) {
        this.baseUrl = baseURL;
    }

    // GET request
    public async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    // POST request
    public async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    // PUT request
    public async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    public async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }

    // General request method
    private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            this.checkResponseStatus(response);
            return (await response.json()) as T;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Check if response is successful (status in range 200-299)
    private checkResponseStatus(response: Response) {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    }

    // Error handler
    private handleError(error: any) {
        console.error("Error occurred:", error);
    }
}

export default ApiClient;
