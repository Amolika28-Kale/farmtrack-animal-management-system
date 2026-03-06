import { useEffect, useState } from "react";
import { 
  Apple, Calendar, Clock, Plus, Droplets, 
  Sprout, Wheat, Beaker, Sun, Moon, Star,
  Edit2, Trash2, Search, AlertCircle
} from "lucide-react";
import api from "../services/api";
import React from "react";

export default function DietRecords() {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    morningFeed: "",
    afternoonFeed: "",
    eveningFeed: "",
    supplements: "",
    waterIntake: ""
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
        const res = await api.get(`/diet/${animalId}`);
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
      if (editingRecord) {
        // Update existing record
        await api.put(`/diet/${editingRecord._id}`, form);
      } else {
        // Create new record
        await api.post("/diet", { ...form, animalId: selectedAnimal });
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
      morningFeed: record.morningFeed || "",
      afternoonFeed: record.afternoonFeed || "",
      eveningFeed: record.eveningFeed || "",
      supplements: record.supplements || "",
      waterIntake: record.waterIntake || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/diet/${id}`);
      setShowDeleteConfirm(null);
      loadRecords(selectedAnimal);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record");
    }
  };

  const resetForm = () => {
    setForm({
      morningFeed: "",
      afternoonFeed: "",
      eveningFeed: "",
      supplements: "",
      waterIntake: ""
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getAnimalName = (id) => {
    const animal = animals.find(a => a._id === id);
    return animal ? `${animal.name} (${animal.type})` : '';
  };

  const getFeedIcon = (type) => {
    switch(type) {
      case 'morning': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'afternoon': return <Sun className="w-4 h-4 text-orange-500" />;
      case 'evening': return <Moon className="w-4 h-4 text-indigo-500" />;
      default: return <Apple className="w-4 h-4" />;
    }
  };

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const dateStr = new Date(record.date).toLocaleDateString();
    return dateStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalWater = records.reduce((sum, r) => sum + (r.waterIntake || 0), 0);
  const avgWater = records.length > 0 ? (totalWater / records.length).toFixed(1) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Diet Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Track nutrition and feeding schedules
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 bg-gray-50"
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
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
              <Apple className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-xs text-gray-600">Total Records</p>
              <p className="text-xl font-bold text-gray-800">{records.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
              <Droplets className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-xs text-gray-600">Avg Water</p>
              <p className="text-xl font-bold text-gray-800">{avgWater}L</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <Sprout className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xs text-gray-600">Total Water</p>
              <p className="text-xl font-bold text-gray-800">{totalWater}L</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl">
              <Beaker className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-xs text-gray-600">Supplements</p>
              <p className="text-xl font-bold text-gray-800">
                {records.filter(r => r.supplements).length}
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Add/Edit Record Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-amber-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {editingRecord ? <Edit2 className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-amber-600" />}
                {editingRecord ? 'Edit' : 'New'} Diet Record for {getAnimalName(selectedAnimal)}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      Morning Feed
                    </label>
                    <input
                      type="text"
                      value={form.morningFeed}
                      onChange={(e) => setForm({ ...form, morningFeed: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="e.g., 5kg green fodder"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-orange-500" />
                      Afternoon Feed
                    </label>
                    <input
                      type="text"
                      value={form.afternoonFeed}
                      onChange={(e) => setForm({ ...form, afternoonFeed: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="e.g., 3kg concentrate"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      Evening Feed
                    </label>
                    <input
                      type="text"
                      value={form.eveningFeed}
                      onChange={(e) => setForm({ ...form, eveningFeed: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="e.g., 5kg green fodder"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      Supplements
                    </label>
                    <input
                      type="text"
                      value={form.supplements}
                      onChange={(e) => setForm({ ...form, supplements: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="e.g., Mineral mix, vitamins"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Water Intake (Liters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.waterIntake}
                      onChange={(e) => setForm({ ...form, waterIntake: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="e.g., 40"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all"
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

          {/* Records List - Mobile Optimized with CRUD */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Diet History
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Apple className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No diet records found</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                >
                  Add your first diet record
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
                          <p className="text-sm text-gray-700 mb-3">Delete this diet record?</p>
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

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.morningFeed && (
                        <div className="bg-white p-3 rounded-lg flex items-start gap-2">
                          {getFeedIcon('morning')}
                          <div>
                            <p className="text-xs text-gray-500">Morning</p>
                            <p className="text-sm font-medium text-gray-800">{record.morningFeed}</p>
                          </div>
                        </div>
                      )}
                      {record.afternoonFeed && (
                        <div className="bg-white p-3 rounded-lg flex items-start gap-2">
                          {getFeedIcon('afternoon')}
                          <div>
                            <p className="text-xs text-gray-500">Afternoon</p>
                            <p className="text-sm font-medium text-gray-800">{record.afternoonFeed}</p>
                          </div>
                        </div>
                      )}
                      {record.eveningFeed && (
                        <div className="bg-white p-3 rounded-lg flex items-start gap-2">
                          {getFeedIcon('evening')}
                          <div>
                            <p className="text-xs text-gray-500">Evening</p>
                            <p className="text-sm font-medium text-gray-800">{record.eveningFeed}</p>
                          </div>
                        </div>
                      )}
                      {record.supplements && (
                        <div className="bg-white p-3 rounded-lg flex items-start gap-2 sm:col-span-2">
                          <Star className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-xs text-gray-500">Supplements</p>
                            <p className="text-sm font-medium text-gray-800">{record.supplements}</p>
                          </div>
                        </div>
                      )}
                      {record.waterIntake > 0 && (
                        <div className="bg-white p-3 rounded-lg flex items-start gap-2 sm:col-span-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500">Water Intake</p>
                            <p className="text-sm font-medium text-gray-800">{record.waterIntake}L</p>
                          </div>
                        </div>
                      )}
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