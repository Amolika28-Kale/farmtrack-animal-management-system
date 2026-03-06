import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Info, Droplet, Apple, Heart, Calendar,
  Weight, Tag, Clock, AlertCircle, ChevronRight
} from "lucide-react";
import api from "../services/api";
import React from "react";

export default function AnimalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [milkRecords, setMilkRecords] = useState([]);
  const [dietRecords, setDietRecords] = useState([]);
  const [pregnancyRecords, setPregnancyRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const animalRes = await api.get(`/animals`);
      const animalData = animalRes.data.find(a => a._id === id);
      setAnimal(animalData);

      const milkRes = await api.get(`/milk/${id}`);
      setMilkRecords(milkRes.data);

      const dietRes = await api.get(`/diet/${id}`);
      setDietRecords(dietRes.data);

      const pregRes = await api.get(`/pregnancy/${id}`);
      setPregnancyRecords(pregRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    return type === "Cow" ? "🐄" : "🐃";
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
          <p className="mt-4 text-gray-600 font-medium">Loading animal details...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Animal Not Found</h2>
          <p className="text-gray-600 mb-6">The animal you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/animals")}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Back to Animals
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Info", icon: Info, color: "blue" },
    { id: "milk", label: "Milk", icon: Droplet, color: "yellow" },
    { id: "diet", label: "Diet", icon: Apple, color: "orange" },
    { id: "pregnancy", label: "Pregnancy", icon: Heart, color: "pink" }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/animals")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {animal.name}
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <span>{animal.type} • {animal.breed}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {animal.tagNumber}
            </span>
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl bg-white bg-opacity-20 p-4 rounded-2xl">
            {getTypeIcon(animal.type)}
          </div>
          <div>
            <p className="text-sm opacity-90">Animal ID</p>
            <p className="text-2xl font-bold">#{animal.tagNumber}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs opacity-80">Age</p>
            <p className="text-lg sm:text-xl font-bold">{animal.age} years</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Weight</p>
            <p className="text-lg sm:text-xl font-bold">{animal.weight} kg</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Milk/Day</p>
            <p className="text-lg sm:text-xl font-bold">{animal.milkPerDay}L</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Status</p>
            <p className="text-lg sm:text-xl font-bold">{animal.pregnancyStatus}</p>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
          {tabs.map(({ id: tabId, label, icon: Icon, color }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex-1 min-w-[100px] flex flex-col items-center gap-1 px-3 py-4 transition-colors ${
                activeTab === tabId
                  ? `text-${color}-600 border-b-2 border-${color}-600`
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                activeTab === tabId ? `text-${color}-600` : 'text-gray-400'
              }`} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="font-semibold text-gray-800">{animal.type}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Breed</p>
                  <p className="font-semibold text-gray-800">{animal.breed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Color</p>
                  <p className="font-semibold text-gray-800">{animal.color}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Purchase Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(animal.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-green-600" />
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium text-gray-800">{animal.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium text-gray-800">{animal.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Milk Production:</span>
                    <span className="font-medium text-green-600">{animal.milkPerDay}L/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pregnancy Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(animal.pregnancyStatus)}`}>
                      {animal.pregnancyStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {animal.notes && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{animal.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Milk Records Tab */}
          {activeTab === "milk" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Milk Production History</h3>
                <span className="text-sm text-gray-500">Total: {milkRecords.length} records</span>
              </div>
              
              {milkRecords.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No milk records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {milkRecords.map((record) => (
                    <div key={record._id} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-lg font-bold text-green-600">{record.totalMilk}L</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Morning</p>
                          <p className="font-semibold text-gray-800">{record.morningMilk}L</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Evening</p>
                          <p className="font-semibold text-gray-800">{record.eveningMilk}L</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Diet Records Tab */}
          {activeTab === "diet" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Diet History</h3>
                <span className="text-sm text-gray-500">Total: {dietRecords.length} records</span>
              </div>
              
              {dietRecords.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Apple className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No diet records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dietRecords.map((record) => (
                    <div key={record._id} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Morning</p>
                          <p className="font-medium text-gray-800">{record.morningFeed || '—'}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Afternoon</p>
                          <p className="font-medium text-gray-800">{record.afternoonFeed || '—'}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Evening</p>
                          <p className="font-medium text-gray-800">{record.eveningFeed || '—'}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Water</p>
                          <p className="font-medium text-gray-800">{record.waterIntake || 0}L</p>
                        </div>
                      </div>
                      {record.supplements && (
                        <div className="mt-2 bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Supplements</p>
                          <p className="font-medium text-gray-800">{record.supplements}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pregnancy Records Tab */}
          {activeTab === "pregnancy" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Pregnancy History</h3>
                <span className="text-sm text-gray-500">Total: {pregnancyRecords.length} records</span>
              </div>
              
              {pregnancyRecords.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pregnancy records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pregnancyRecords.map((record) => {
                    const startDate = new Date(record.pregnancyStartDate);
                    const deliveryDate = new Date(record.expectedDeliveryDate);
                    const today = new Date();
                    const daysRemaining = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
                    const totalDays = Math.ceil((deliveryDate - startDate) / (1000 * 60 * 60 * 24));
                    const progress = ((totalDays - daysRemaining) / totalDays) * 100;

                    return (
                      <div key={record._id} className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Started: {startDate.toLocaleDateString()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            daysRemaining > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Delivered'}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        {daysRemaining > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-white p-2 rounded-lg">
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="font-medium text-gray-800">{startDate.toLocaleDateString()}</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg">
                            <p className="text-xs text-gray-500">Expected Delivery</p>
                            <p className="font-medium text-gray-800">{deliveryDate.toLocaleDateString()}</p>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="bg-white p-2 rounded-lg">
                            <p className="text-xs text-gray-500">Notes</p>
                            <p className="text-sm text-gray-700">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}