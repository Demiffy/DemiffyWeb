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
      const response = await fetch('/api/database', {
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
      const response = await fetch('/api/database', {
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-6 shadow-md">
        <h1 className="text-4xl font-bold text-center text-blue-400">
          Supabase Database Manager
        </h1>
      </header>

      <main className="flex-grow p-6 container mx-auto">
        {/* Form for Adding Data */}
        <section className="bg-gray-800 p-8 rounded-lg shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-6 text-blue-300">Add New Data</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="mb-2 text-sm font-medium text-gray-300"
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter name"
                required
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="message"
                className="mb-2 text-sm font-medium text-gray-300"
              >
                Message:
              </label>
              <input
                type="text"
                id="message"
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                className="p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter message"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition-colors ${
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

        {/* Display Table Data */}
        <section className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-blue-300">Stored Data</h2>
          {loading ? (
            <p className="text-gray-400">Loading data...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : tableData.length === 0 ? (
            <p className="text-gray-400">No data found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-4 text-blue-300 font-semibold">ID</th>
                    <th className="p-4 text-blue-300 font-semibold">Name</th>
                    <th className="p-4 text-blue-300 font-semibold">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                      } hover:bg-gray-600`}
                    >
                      <td className="p-4">{row.id}</td>
                      <td className="p-4">{row.name}</td>
                      <td className="p-4">{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-gray-800 p-6 text-center">
        <p className="text-gray-400 text-sm">
          Powered by Supabase | Modern UI with TailwindCSS
        </p>
      </footer>
    </div>
  );
};

export default Databasetest;