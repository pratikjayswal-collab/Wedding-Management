import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGuest, updateGuest } from '../../store/slices/guestSlice';
import { closeGuestModal, setEditingGuest } from '../../store/slices/uiSlice';

export default function AddGuestModal() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    extraMembersCount: 0,
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [isRecordingName, setIsRecordingName] = useState(false);
  const [isRecordingContact, setIsRecordingContact] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const defaultTags = [
    'Friend',
    'Relative',
    'Society member',
    'Neighbour',
    'office colleague',
    'College Friend',
    'School Friend',
    'Business Associate',
    'Vip guest',
  ];
  const [availableTags, setAvailableTags] = useState(defaultTags);
  const [newTag, setNewTag] = useState('');

  const dispatch = useDispatch();
  const { isGuestModalOpen, isLoading, editingGuest } = useSelector((state) => state.ui);
  const { error } = useSelector((state) => state.guest);

  // Normalize multilingual spoken numbers (Hindi/Gujarati/English words and native digits) into ASCII digits
  const normalizeSpeechToDigits = (input = '') => {
    let s = String(input).trim();
    // Map Gujarati digits ૦-૯ to 0-9
    const guDigits = { '૦':'0','૧':'1','૨':'2','૩':'3','૪':'4','૫':'5','૬':'6','૭':'7','૮':'8','૯':'9' };
    s = s.replace(/[૦-૯]/g, ch => guDigits[ch] || '');
    // Map Devanagari digits ०-९ to 0-9
    const hiDigits = { '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9' };
    s = s.replace(/[०-९]/g, ch => hiDigits[ch] || '');
    // Map number words to digits (Gujarati, Hindi, English)
    const wordToDigit = {
      // Gujarati
      'શૂન્ય':'0','ઝીરો':'0','જીરો':'0','એક':'1','બે':'2','ત્રણ':'3','ચાર':'4','પાંચ':'5','છ':'6','સાત':'7','આઠ':'8','નવ':'9',
      // Hindi
      'शून्य':'0','जीरो':'0','शून्यं':'0','एक':'1','दो':'2','तीन':'3','चार':'4','पांच':'5','पाँच':'5','छह':'6','सात':'7','आठ':'8','नौ':'9',
      // English
      'zero':'0','oh':'0','o':'0','one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9'
    };
    const tokens = s.toLowerCase().match(/[a-zA-Z]+|\d+/g) || [];
    let out = '';
    for (const tok of tokens) {
      if (/^\d+$/.test(tok)) { out += tok; continue; }
      const mapped = wordToDigit[tok];
      if (mapped != null) out += mapped;
    }
    // Fallback: also extract any remaining ASCII digits from original string
    const asciiDigits = s.replace(/\D/g, '');
    if (out.length === 0 && asciiDigits) out = asciiDigits;
    return out.slice(0, 15);
  };

  // Gemini API speech-to-text functionality
  const startRecording = async (field) => {
    try {
      setSpeechError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', blob, 'speech.webm');
          formData.append('lang', 'en-IN');

          const response = await fetch('http://localhost:5000/api/users/transcribe', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data?.message || 'Transcription failed');

          if (data?.text) {
            if (field === 'name') {
              setFormData(prev => ({ ...prev, name: data.text }));
            } else if (field === 'contact') {
              setFormData(prev => ({ ...prev, contact: normalizeSpeechToDigits(data.text) }));
            }
          }
        } catch (error) {
          setSpeechError(`Transcription error: ${error.message}`);
        } finally {
          if (field === 'name') setIsRecordingName(false);
          else if (field === 'contact') setIsRecordingContact(false);
        }
      };

      mediaRecorder.start();
      if (field === 'name') setIsRecordingName(true);
      else if (field === 'contact') setIsRecordingContact(true);

      // Stop recording after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 10000);

    } catch (error) {
      setSpeechError('Microphone permission denied');
      if (field === 'name') setIsRecordingName(false);
      else if (field === 'contact') setIsRecordingContact(false);
    }
  };

  const stopRecording = (field) => {
    if (field === 'name') setIsRecordingName(false);
    else if (field === 'contact') setIsRecordingContact(false);
  };

  useEffect(() => {
    if (editingGuest) {
      setFormData({
        name: editingGuest.name || '',
        contact: editingGuest.contact || '',
        extraMembersCount: typeof editingGuest.extraMembersCount === 'number' ? editingGuest.extraMembersCount : 0,
        tags: Array.isArray(editingGuest.tags) ? editingGuest.tags : [],
      });
      // merge guest tags into available
      const guestTags = Array.isArray(editingGuest.tags) ? editingGuest.tags : [];
      const merged = Array.from(new Set([...
        defaultTags,
        ...guestTags.map(t => t?.toString?.() || '').filter(Boolean)
      ]));
      setAvailableTags(merged);
    } else {
      setFormData({ name: '', contact: '', extraMembersCount: 0, tags: [] });
      setAvailableTags(defaultTags);
    }
  }, [editingGuest]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingGuest && editingGuest._id) {
        await dispatch(updateGuest({ id: editingGuest._id, guestData: formData })).unwrap();
      } else {
        await dispatch(createGuest(formData)).unwrap();
      }
      // Reset form and close modal on success
      setFormData({ name: '', contact: '', extraMembersCount: 0, tags: [] });
      setErrors({});
      dispatch(setEditingGuest(null));
      dispatch(closeGuestModal());
    } catch (err) {
      // Error is handled by Redux slice
      console.error('Failed to create guest:', err);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', contact: '', extraMembersCount: 0, tags: [] });
    setErrors({});
    dispatch(setEditingGuest(null));
    dispatch(closeGuestModal());
  };

  if (!isGuestModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-100 to-pink-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingGuest ? 'Edit Guest' : 'Add New Guest'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Guest Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full pr-11 pl-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 ${
                  errors.name ? 'border-red-300 focus:ring-red-200 focus:border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter guest name"
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={() => startRecording('name')} 
                disabled={isLoading || isRecordingName}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                  isRecordingName 
                    ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                    : 'hover:bg-gray-50 text-gray-600'
                } ${!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={
                  !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia 
                    ? 'Microphone not available' 
                    : isRecordingName 
                    ? 'Stop speaking' 
                    : 'Start speaking'
                }
              >
                {isRecordingName ? (
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9A2.25 2.25 0 0118.75 7.5v9A2.25 2.25 0 0116.5 18.75h-9A2.25 2.25 0 015.25 16.5v-9z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
                    <path d="M19 11a7 7 0 11-14 0 1 1 0 112 0 5 5 0 1010 0 1 1 0 112 0z" />
                    <path d="M13 19.938V22h-2v-2.062a8.001 8.001 0 01-6.938-6.937h2.062A6 6 0 0012 18a6 6 0 005.876-4h2.062A8.001 8.001 0 0113 19.938z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            {speechError && (
              <p className="mt-1 text-sm text-amber-600">
                Speech Error: {speechError}
              </p>
            )}
          </div>

          {/* Contact Field */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number (optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className={`w-full pr-11 pl-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 ${errors.contact ? 'border-red-300 focus:ring-red-200 focus:border-red-300' : 'border-gray-200'}`}
                placeholder="Enter contact number"
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={() => startRecording('contact')} 
                disabled={isLoading || isRecordingContact}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                  isRecordingContact 
                    ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                    : 'hover:bg-gray-50 text-gray-600'
                } ${!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={
                  !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia 
                    ? 'Microphone not available' 
                    : isRecordingContact 
                    ? 'Stop speaking' 
                    : 'Start speaking'
                }
              >
                {isRecordingContact ? (
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9A2.25 2.25 0 0118.75 7.5v9A2.25 2.25 0 0116.5 18.75h-9A2.25 2.25 0 015.25 16.5v-9z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
                    <path d="M19 11a7 7 0 11-14 0 1 1 0 112 0 5 5 0 1010 0 1 1 0 112 0z" />
                    <path d="M13 19.938V22h-2v-2.062a8.001 8.001 0 01-6.938-6.937h2.062A6 6 0 0012 18a6 6 0 005.876-4h2.062A8.001 8.001 0 0113 19.938z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.contact && (
              <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
            )}
            {speechError && (
              <p className="mt-1 text-sm text-amber-600">
                Speech Error: {speechError}
              </p>
            )}
          </div>

          {/* Extra Members Count Field */}
          <div>
            <label htmlFor="extraMembersCount" className="block text-sm font-medium text-gray-700 mb-2">
              Extra Members (optional)
            </label>
            <input
              type="number"
              id="extraMembersCount"
              name="extraMembersCount"
              value={formData.extraMembersCount}
              onChange={(e) => setFormData(prev => ({ ...prev, extraMembersCount: Math.max(0, Number(e.target.value) || 0) }))}
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 ${errors.extraMembersCount ? 'border-red-300 focus:ring-red-200 focus:border-red-300' : 'border-gray-200'}`}
              placeholder="e.g., 2"
              min={0}
              disabled={isLoading}
            />
            {errors.extraMembersCount && (
              <p className="mt-1 text-sm text-red-600">{errors.extraMembersCount}</p>
            )}
          </div>

          {/* Tags multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map((tag) => {
                const selected = formData.tags.includes(tag.toLowerCase());
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => {
                      setFormData(prev => {
                        const normalized = tag.toLowerCase();
                        if (prev.tags.includes(normalized)) {
                          return { ...prev, tags: prev.tags.filter(t => t !== normalized) };
                        }
                        return { ...prev, tags: [...prev.tags, normalized] };
                      });
                    }}
                    className={`px-3 py-1 rounded-full border text-sm ${selected ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-gray-200 text-gray-700'}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                placeholder="Add custom tag and press +"
              />
              <button
                type="button"
                onClick={() => {
                  const clean = newTag.trim();
                  if (!clean) return;
                  const normalized = clean.toLowerCase();
                  setAvailableTags(prev => Array.from(new Set([...prev, clean])));
                  setFormData(prev => ({ ...prev, tags: Array.from(new Set([...prev.tags, normalized])) }));
                  setNewTag('');
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Browser Support Warning */}
          {(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                Microphone access is not supported in this browser. Please use a modern browser with microphone permissions for voice input.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingGuest ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                editingGuest ? 'Update Guest' : 'Add Guest'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}