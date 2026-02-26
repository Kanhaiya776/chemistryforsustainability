class RestService {
  static async get(url: string): Promise<any> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`An error occurred: ${error.message}`);
    }
  }

  static async post(url: string, body: any): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`An error occurred: ${error.message}`);
    }
  }
}

export default RestService;
