import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Droplet, Calendar, Plus, TrendingUp, Clock, 
  Download, Share2, Edit2, Trash2, X, Check,
  AlertCircle, Filter, Search
} from "lucide-react";
import api from "../services/api";
import React from "react";

export default function MilkRecords() {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    morningMilk: "",
    eveningMilk: ""
  });
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const res = await api.get("/animals");
      setAnimals(res.data);
    } catch (error) {
      console.error("Error loading animals:", error);
    }
  };

  const loadRecords = async (animalId) => {
    setLoading(true);
    try {
      if (animalId) {
        const res = await api.get(`/milk/${animalId}`);
        setRecords(res.data);
      }
    } catch (error) {
      console.error("Error loading records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalChange = (animalId) => {
    setSelectedAnimal(animalId);
    loadRecords(animalId);
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const total = parseFloat(form.morningMilk || 0) + parseFloat(form.eveningMilk || 0);
      
      if (editingRecord) {
        // Update existing record
        await api.put(`/milk/${editingRecord._id}`, {
          ...form,
          totalMilk: total
        });
      } else {
        // Create new record
        await api.post("/milk", { 
          ...form, 
          animalId: selectedAnimal, 
          totalMilk: total 
        });
      }
      
      resetForm();
      loadRecords(selectedAnimal);
    } catch (error) {
      console.error("Error saving record:", error);
      alert(error.response?.data?.message || "Error saving record");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      date: record.date.split('T')[0],
      morningMilk: record.morningMilk,
      eveningMilk: record.eveningMilk
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/milk/${id}`);
      setShowDeleteConfirm(null);
      loadRecords(selectedAnimal);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record");
    }
  };

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      morningMilk: "",
      eveningMilk: ""
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getAnimalName = (id) => {
    const animal = animals.find(a => a._id === id);
    return animal ? `${animal.name} (${animal.type})` : '';
  };

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const dateStr = new Date(record.date).toLocaleDateString();
    return dateStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const chartData = filteredRecords.slice(0, 7).reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    morning: r.morningMilk,
    evening: r.eveningMilk,
    total: r.totalMilk
  }));

  const totalMilk = records.reduce((sum, r) => sum + r.totalMilk, 0);
  const avgMilk = records.length > 0 ? (totalMilk / records.length).toFixed(1) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Milk Records
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Track and monitor daily milk production
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Close Form' : 'Add Record'}
        </button>
      </div>

      {/* Animal Selector */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Animal
        </label>
        <select
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50"
          value={selectedAnimal}
          onChange={(e) => handleAnimalChange(e.target.value)}
        >
          <option value="">Choose an animal</option>
          {animals.map((animal) => (
            <option key={animal._id} value={animal._id}>
              {animal.name} ({animal.type}) - {animal.tagNumber}
            </option>
          ))}
        </select>
      </div>

      {selectedAnimal && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <Droplet className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-xs text-gray-600">Total Milk</p>
              <p className="text-xl font-bold text-gray-800">{totalMilk}L</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xs text-gray-600">Average</p>
              <p className="text-xl font-bold text-gray-800">{avgMilk}L</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <Calendar className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-xs text-gray-600">Records</p>
              <p className="text-xl font-bold text-gray-800">{records.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <Clock className="w-5 h-5 text-yellow-600 mb-2" />
              <p className="text-xs text-gray-600">Last 7 Days</p>
              <p className="text-xl font-bold text-gray-800">
                {chartData.reduce((sum, d) => sum + d.total, 0)}L
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Add/Edit Record Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-blue-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {editingRecord ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                {editingRecord ? 'Edit' : 'New'} Milk Record for {getAnimalName(selectedAnimal)}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Morning (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.morningMilk}
                      onChange={(e) => setForm({ ...form, morningMilk: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evening (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.eveningMilk}
                      onChange={(e) => setForm({ ...form, eveningMilk: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    {editingRecord ? 'Update Record' : 'Save Record'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Production Trend (Last 7 Days)
                </h2>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Bar dataKey="morning" fill="#3b82f6" name="Morning (L)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="evening" fill="#f59e0b" name="Evening (L)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Records List - Mobile Optimized with CRUD */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Milk Records History
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No milk records found</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first record
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div key={record._id} className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors relative group">
                    {/* Delete Confirmation */}
                    {showDeleteConfirm === record._id && (
                      <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center p-4 z-10">
                        <div className="text-center">
                          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-700 mb-3">Delete this record?</p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleDelete(record._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{record.totalMilk}L</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(record._id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Morning</p>
                        <p className="text-base font-semibold text-gray-800">{record.morningMilk}L</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Evening</p>
                        <p className="text-base font-semibold text-gray-800">{record.eveningMilk}L</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}