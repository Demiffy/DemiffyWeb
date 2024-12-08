import React, { useState, useEffect } from 'react';

const Databasetest: React.FC = () => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/firebaseHandler', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data.');
      }
      const data = await response.json();
      setTableData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/firebaseHandler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save data.');
      }
      const result = await response.json();
      setSuccessMessage(result.message || 'Data saved successfully.');
      setFormData({});
      fetchData();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col pt-12">
      <header className="p-6">
        <h1 className="text-3xl font-bold text-center">Firebase Database Test</h1>
      </header>

      <main className="flex-grow p-6">
        <section className="bg-gray-700 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Data</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-600 text-white rounded-lg"
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message:
              </label>
              <input
                type="text"
                id="message"
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-600 text-white rounded-lg"
                placeholder="Enter message"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
                loading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Data'}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4">{error}</p>}
          {successMessage && <p className="text-green-400 mt-4">{successMessage}</p>}
        </section>

        <section className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Stored Data</h2>
          {loading ? (
            <p>Loading data...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : tableData.length === 0 ? (
            <p>No data found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-600">
              <thead>
                <tr>
                  <th className="border border-gray-600 p-3">ID</th>
                  <th className="border border-gray-600 p-3">Name</th>
                  <th className="border border-gray-600 p-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id} className="even:bg-gray-800">
                    <td className="border border-gray-600 p-3">{row.id}</td>
                    <td className="border border-gray-600 p-3">{row.name}</td>
                    <td className="border border-gray-600 p-3">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default Databasetest;