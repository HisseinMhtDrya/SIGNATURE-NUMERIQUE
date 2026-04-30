import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSignature, FaUser, FaEnvelope, FaCalendar, FaLock, FaCheck, FaTimes } from 'react-icons/fa';

const SignatureWorkflow = ({ documentId, onClose }) => {
  const [document, setDocument] = useState(null);
  const [signers, setSigners] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState(null);
  const [newSigner, setNewSigner] = useState({ name: '', email: '' });
  const [showAddSigner, setShowAddSigner] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const canvasRef = useRef(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocument(response.data);
      setSigners(response.data.signers || []);
    } catch (error) {
      showAlert('danger', 'Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  const addSigner = async () => {
    if (!newSigner.name || !newSigner.email) {
      showAlert('danger', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/documents/${documentId}/signers`, 
        newSigner,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSigners([...signers, response.data]);
      setNewSigner({ name: '', email: '' });
      setShowAddSigner(false);
      showAlert('success', 'Signataire ajouté');
    } catch (error) {
      showAlert('danger', 'Erreur lors de l\'ajout du signataire');
    }
  };

  const removeSigner = async (signerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/documents/${documentId}/signers/${signerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSigners(signers.filter(s => s._id !== signerId));
      showAlert('success', 'Signataire supprimé');
    } catch (error) {
      showAlert('danger', 'Erreur lors de la suppression');
    }
  };

  const startDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let drawing = false;

    canvas.addEventListener('mousedown', (e) => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!drawing) return;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    });

    canvas.addEventListener('mouseup', () => {
      drawing = false;
    });

    canvas.addEventListener('mouseleave', () => {
      drawing = false;
    });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    setSignature(dataURL);
  };

  const submitSignature = async () => {
    if (!signature) {
      showAlert('danger', 'Veuillez signer le document');
      return;
    }

    setSigning(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/documents/${documentId}/sign`, 
        { signature },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showAlert('success', 'Document signé avec succès');
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      showAlert('danger', 'Erreur lors de la signature');
    } finally {
      setSigning(false);
    }
  };

  const sendToSigners = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/documents/${documentId}/send`, 
        { signers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showAlert('success', 'Document envoyé aux signataires');
      setCurrentStep(3);
    } catch (error) {
      showAlert('danger', 'Erreur lors de l\'envoi');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Alert */}
      {alert.message && (
        <div className={`alert alert-${alert.type} mb-4`} role="alert">
          {alert.message}
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
              currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Add Signers */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaUser className="mr-3" />
            Ajouter les signataires
          </h2>

          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded mb-6">
            <h3 className="font-semibold">{document?.name}</h3>
            <p className="text-sm text-gray-600">
              Taille: {document?.size ? (document.size / 1024 / 1024).toFixed(2) : '0'} MB
            </p>
          </div>

          {/* Signers List */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Signataires ({signers.length})</h3>
            {signers.map((signer, index) => (
              <div key={signer._id} className="flex items-center justify-between bg-gray-50 p-3 rounded mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{signer.name}</p>
                    <p className="text-sm text-gray-600">{signer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeSigner(signer._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          {/* Add Signer Form */}
          {showAddSigner && (
            <div className="bg-blue-50 p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nom du signataire"
                  value={newSigner.name}
                  onChange={(e) => setNewSigner({ ...newSigner, name: e.target.value })}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email du signataire"
                  value={newSigner.email}
                  onChange={(e) => setNewSigner({ ...newSigner, email: e.target.value })}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addSigner}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddSigner(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setShowAddSigner(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <FaUser className="inline mr-2" />
              Ajouter un signataire
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={signers.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure & Send */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaEnvelope className="mr-3" />
            Configuration et envoi
          </h2>

          {/* Signers Order */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Ordre de signature</h3>
            {signers.map((signer, index) => (
              <div key={signer._id} className="flex items-center bg-gray-50 p-3 rounded mb-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{signer.name}</p>
                  <p className="text-sm text-gray-600">{signer.email}</p>
                </div>
                {index > 0 && (
                  <button className="text-gray-600 hover:text-gray-800 mr-2">
                    ↑
                  </button>
                )}
                {index < signers.length - 1 && (
                  <button className="text-gray-600 hover:text-gray-800">
                    ↓
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Email Options */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Options d'email</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Envoyer immédiatement
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Rappel automatique
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Notification de completion
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Précédent
            </button>
            <button
              onClick={sendToSigners}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              <FaEnvelope className="inline mr-2" />
              Envoyer aux signataires
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Signature */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaSignature className="mr-3" />
            Signature du document
          </h2>

          {/* Document Preview */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Aperçu du document</h3>
            <div className="bg-gray-100 p-4 rounded text-center">
              <p className="text-gray-600">{document?.name}</p>
              <p className="text-sm text-gray-500">
                Veuillez signer ci-dessous pour confirmer
              </p>
            </div>
          </div>

          {/* Signature Canvas */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Votre signature</h3>
            <div className="border-2 border-dashed border-gray-300 rounded p-2">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border border-gray-400 rounded cursor-crosshair bg-white"
                onMouseDown={startDrawing}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={clearSignature}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Effacer
              </button>
              <button
                onClick={saveSignature}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>

          {/* Signature Preview */}
          {signature && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Aperçu de la signature</h3>
              <img src={signature} alt="Signature" className="border border-gray-300 rounded" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              onClick={submitSignature}
              disabled={!signature || signing}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {signing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                  Signature en cours...
                </>
              ) : (
                <>
                  <FaCheck className="inline mr-2" />
                  Signer le document
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureWorkflow;
