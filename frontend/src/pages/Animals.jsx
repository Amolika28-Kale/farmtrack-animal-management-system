import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Eye, Edit2, Trash2, Plus, X, Search, Filter, 
  ChevronDown, Calendar, Tag, Weight, Droplet,
  Heart, AlertCircle
} from "lucide-react";
import api from "../services/api";
import React from "react";

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    type: "Cow",
    breed: "",
    age: "",
    weight: "",
    color: "",
    purchaseDate: "",
    tagNumber: "",
    milkPerDay: "",
    pregnancyStatus: "Not Pregnant",
    notes: ""
  });

  useEffect(() => {
    loadAnimals();
  }, []);

  useEffect(() => {
    filterAnimals();
  }, [searchTerm, filterType, animals]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/animals");
      setAnimals(res.data);
      setFilteredAnimals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterAnimals = () => {
    let filtered = animals;
    
    if (searchTerm) {
      filtered = filtered.filter(animal => 
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(animal => animal.type === filterType);
    }

    setFilteredAnimals(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/animals/${editingId}`, form);
      } else {
        await api.post("/animals", form);
      }
      resetForm();
      setShowModal(false);
      loadAnimals();
    } catch (e) {
      console.error(e);
    }
  };

  const editAnimal = (animal) => {
    setForm(animal);
    setEditingId(animal._id);
    setShowModal(true);
  };

  const deleteAnimal = async (id) => {
    if (window.confirm("Are you sure you want to delete this animal?")) {
      try {
        await api.delete(`/animals/${id}`);
        loadAnimals();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "Cow",
      breed: "",
      age: "",
      weight: "",
      color: "",
      purchaseDate: "",
      tagNumber: "",
      milkPerDay: "",
      pregnancyStatus: "Not Pregnant",
      notes: ""
    });
    setEditingId(null);
  };

  const getTypeColor = (type) => {
    return type === "Cow" 
      ? "bg-orange-100 text-orange-700 border-orange-200" 
      : "bg-purple-100 text-purple-700 border-purple-200";
  };

  const getStatusColor = (status) => {
    return status === "Pregnant"
      ? "bg-pink-100 text-pink-700 border-pink-200"
      : "bg-green-100 text-green-700 border-green-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your animals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Animals
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your livestock and track their health
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Animal
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, tag or breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Filter Toggle for Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-700"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filter Options */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("Cow")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "Cow"
                    ? "bg-orange-600 text-white"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                Cows
              </button>
              <button
                onClick={() => setFilterType("Buffalo")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "Buffalo"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                Buffaloes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animals Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No animals found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filters" 
              : "Get started by adding your first animal"}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Your First Animal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAnimals.map((animal) => (
            <div
              key={animal._id}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Card Header with Gradient */}
              <div className="relative h-32 bg-gradient-to-r from-green-400 to-emerald-500">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(animal.type)}`}>
                    {animal.type}
                  </span>
                </div>
                <div className="absolute -bottom-8 left-4">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                    <span className="text-3xl">{animal.type === "Cow" ? "🐄" : "🐃"}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="pt-10 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{animal.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Tag className="w-3 h-3" />
                      {animal.tagNumber}
                    </p>
                  </div>
                </div>

                {/* Animal Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Breed:</span>
                    <span className="font-medium text-gray-800">{animal.breed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Age:
                    </span>
                    <span className="font-medium text-gray-800">{animal.age} years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Weight className="w-3 h-3" /> Weight:
                    </span>
                    <span className="font-medium text-gray-800">{animal.weight} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> Milk/Day:
                    </span>
                    <span className="font-medium text-green-600">{animal.milkPerDay}L</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(animal.pregnancyStatus)}`}>
                    <Heart className="w-3 h-3" />
                    {animal.pregnancyStatus}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    to={`/animals/${animal._id}`}
                    className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Link>
                  <button
                    onClick={() => editAnimal(animal)}
                    className="flex items-center justify-center gap-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAnimal(animal._id)}
                    className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowModal(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingId ? "Edit Animal" : "Add New Animal"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      required
                      placeholder="Enter animal name"
                    />
                  </div>

                  {/* Type */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                    >
                      <option value="Cow">Cow</option>
                      <option value="Buffalo">Buffalo</option>
                    </select>
                  </div>

                  {/* Breed */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Breed <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.breed}
                      onChange={(e) => setForm({ ...form, breed: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      required
                      placeholder="e.g., Holstein"
                    />
                  </div>

                  {/* Age */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  {/* Weight */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  {/* Color */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      required
                      placeholder="e.g., Black & White"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.purchaseDate}
                      onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      required
                    />
                  </div>

                  {/* Tag Number */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.tagNumber}
                      onChange={(e) => setForm({ ...form, tagNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      required
                      placeholder="e.g., TAG001"
                    />
                  </div>

                  {/* Milk Per Day */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Milk Per Day (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.milkPerDay}
                      onChange={(e) => setForm({ ...form, milkPerDay: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                      min="0"
                    />
                  </div>

                  {/* Pregnancy Status */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pregnancy Status
                    </label>
                    <select
                      value={form.pregnancyStatus}
                      onChange={(e) => setForm({ ...form, pregnancyStatus: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                    >
                      <option value="Not Pregnant">Not Pregnant</option>
                      <option value="Pregnant">Pregnant</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm resize-none"
                      rows="3"
                      placeholder="Any additional notes about the animal..."
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all"
                  >
                    {editingId ? "Update Animal" : "Add Animal"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}