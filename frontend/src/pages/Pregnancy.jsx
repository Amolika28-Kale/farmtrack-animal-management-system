import { useEffect, useState } from "react";
import { 
  Heart, Calendar, Clock, Plus, AlertCircle,
  Baby, Activity, TrendingUp, Flower2,
  Edit2, Trash2, Search, CheckCircle
} from "lucide-react";
import api from "../services/api";
import React from "react";

export default function Pregnancy() {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showMarkDelivered, setShowMarkDelivered] = useState(null);
  const [form, setForm] = useState({
    pregnancyStartDate: "",
    expectedDeliveryDate: "",
    notes: ""
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
        const res = await api.get(`/pregnancy/${animalId}`);
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
        await api.put(`/pregnancy/${editingRecord._id}`, form);
      } else {
        // Create new record
        await api.post("/pregnancy", { ...form, animalId: selectedAnimal });
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
      pregnancyStartDate: record.pregnancyStartDate.split('T')[0],
      expectedDeliveryDate: record.expectedDeliveryDate.split('T')[0],
      notes: record.notes || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pregnancy/${id}`);
      setShowDeleteConfirm(null);
      loadRecords(selectedAnimal);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record");
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      await api.patch(`/pregnancy/${id}/delivered`);
      setShowMarkDelivered(null);
      loadRecords(selectedAnimal);
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert("Error marking as delivered");
    }
  };

  const resetForm = () => {
    setForm({
      pregnancyStartDate: "",
      expectedDeliveryDate: "",
      notes: ""
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getAnimalName = (id) => {
    const animal = animals.find(a => a._id === id);
    return animal ? `${animal.name} (${animal.type})` : '';
  };

  const calculateDaysRemaining = (deliveryDate) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (startDate, deliveryDate) => {
    const start = new Date(startDate);
    const delivery = new Date(deliveryDate);
    const today = new Date();
    const totalDays = Math.ceil((delivery - start) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const progress = (daysPassed / totalDays) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const startDate = new Date(record.pregnancyStartDate).toLocaleDateString();
    const deliveryDate = new Date(record.expectedDeliveryDate).toLocaleDateString();
    return startDate.includes(searchTerm) || deliveryDate.includes(searchTerm);
  });

  const activePregnancies = records.filter(r => calculateDaysRemaining(r.expectedDeliveryDate) > 0).length;
  const completedPregnancies = records.length - activePregnancies;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Pregnancy Tracking
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Monitor and manage animal pregnancies
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-700 bg-gray-50"
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
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl">
              <Heart className="w-5 h-5 text-pink-600 mb-2" />
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">{records.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl">
              <Activity className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-xs text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-800">{activePregnancies}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-800">{completedPregnancies}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-xs text-gray-600">Due Soon</p>
              <p className="text-xl font-bold text-gray-800">
                {records.filter(r => {
                  const days = calculateDaysRemaining(r.expectedDeliveryDate);
                  return days > 0 && days <= 30;
                }).length}
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>
          </div>

          {/* Add/Edit Record Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-pink-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {editingRecord ? <Edit2 className="w-5 h-5 text-pink-600" /> : <Plus className="w-5 h-5 text-pink-600" />}
                {editingRecord ? 'Edit' : 'New'} Pregnancy Record for {getAnimalName(selectedAnimal)}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.pregnancyStartDate}
                      onChange={(e) => setForm({ ...form, pregnancyStartDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery
                    </label>
                    <input
                      type="date"
                      value={form.expectedDeliveryDate}
                      onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-3 rounded-xl transition-all"
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
              <Clock className="w-5 h-5 text-pink-600" />
              Pregnancy History
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pregnancy records found</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Add your first pregnancy record
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => {
                  const daysRemaining = calculateDaysRemaining(record.expectedDeliveryDate);
                  const progress = calculateProgress(record.pregnancyStartDate, record.expectedDeliveryDate);
                  const isActive = daysRemaining > 0;
                  
                  return (
                    <div key={record._id} className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors relative group">
                      {/* Delete Confirmation */}
                      {showDeleteConfirm === record._id && (
                        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center p-4 z-20">
                          <div className="text-center">
                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-700 mb-3">Delete this pregnancy record?</p>
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

                      {/* Mark as Delivered Confirmation */}
                      {showMarkDelivered === record._id && (
                        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center p-4 z-20">
                          <div className="text-center">
                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-700 mb-3">Mark as delivered?</p>
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleMarkDelivered(record._id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                              >
                                Yes, Mark Delivered
                              </button>
                              <button
                                onClick={() => setShowMarkDelivered(null)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Started: {new Date(record.pregnancyStartDate).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isActive && (
                            <button
                              onClick={() => setShowMarkDelivered(record._id)}
                              className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Mark as Delivered"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
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

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isActive
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isActive ? `${daysRemaining} days remaining` : 'Delivered'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {isActive && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Pregnancy Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Start Date
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(record.pregnancyStartDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Baby className="w-3 h-3" />
                            Expected Delivery
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(record.expectedDeliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {record.notes && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Notes
                          </p>
                          <p className="text-sm text-gray-700">{record.notes}</p>
                        </div>
                      )}

                      {/* Due Date Alert */}
                      {isActive && daysRemaining <= 30 && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-700">
                            Due date approaching! {daysRemaining} days remaining. Prepare for calving.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}