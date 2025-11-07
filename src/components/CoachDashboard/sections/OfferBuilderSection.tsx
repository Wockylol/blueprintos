import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Users, Calendar, Zap } from 'lucide-react';

type Offer = {
  id?: string;
  name: string;
  price: number;
  duration_weeks: number;
  features: string[];
  is_featured: boolean;
  order_index: number;
  image_url: string;
  description: string;
  delivery_type: 'one-on-one' | 'group' | 'async';
};

export function OfferBuilderSection() {
  const { workspace } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadOffers();
  }, [workspace]);

  const loadOffers = async () => {
    if (!workspace?.id) return;

    setLoading(true);
    const { data } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('order_index');

    if (data) {
      setOffers(data.map(d => ({
        id: d.id,
        name: d.name,
        price: d.price,
        duration_weeks: d.duration_weeks,
        features: d.features as string[],
        is_featured: d.is_featured,
        order_index: d.order_index,
        image_url: '',
        description: '',
        delivery_type: 'one-on-one',
      })));
    }
    setLoading(false);
  };

  const handleSaveOffer = async (offer: Offer) => {
    if (!workspace?.id) return;

    try {
      if (offer.id) {
        await supabase
          .from('pricing_tiers')
          .update({
            name: offer.name,
            price: offer.price,
            duration_weeks: offer.duration_weeks,
            features: offer.features,
            is_featured: offer.is_featured,
            order_index: offer.order_index,
          })
          .eq('id', offer.id);
      } else {
        await supabase
          .from('pricing_tiers')
          .insert({
            workspace_id: workspace.id,
            name: offer.name,
            price: offer.price,
            duration_weeks: offer.duration_weeks,
            features: offer.features,
            is_featured: offer.is_featured,
            order_index: offers.length,
            is_active: true,
          });
      }

      await loadOffers();
      setShowForm(false);
      setEditingOffer(null);
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Failed to save offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Delete this offer? This cannot be undone.')) return;

    try {
      await supabase.from('pricing_tiers').delete().eq('id', id);
      await loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const startNewOffer = () => {
    setEditingOffer({
      name: '',
      price: 0,
      duration_weeks: 12,
      features: [''],
      is_featured: false,
      order_index: offers.length,
      image_url: '',
      description: '',
      delivery_type: 'one-on-one',
    });
    setShowForm(true);
  };

  const startEditOffer = (offer: Offer) => {
    setEditingOffer({ ...offer });
    setShowForm(true);
  };

  const addFeature = () => {
    if (!editingOffer) return;
    setEditingOffer({
      ...editingOffer,
      features: [...editingOffer.features, ''],
    });
  };

  const updateFeature = (index: number, value: string) => {
    if (!editingOffer) return;
    const newFeatures = [...editingOffer.features];
    newFeatures[index] = value;
    setEditingOffer({ ...editingOffer, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    if (!editingOffer) return;
    setEditingOffer({
      ...editingOffer,
      features: editingOffer.features.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Offer Builder</h2>
          <p className="text-gray-400">Create coaching packages your clients can purchase</p>
        </div>
        <button onClick={startNewOffer} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Offer</span>
        </button>
      </div>

      {showForm && editingOffer && (
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {editingOffer.id ? 'Edit Offer' : 'Create New Offer'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingOffer(null);
              }}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Package Name *</label>
                <input
                  type="text"
                  value={editingOffer.name}
                  onChange={(e) => setEditingOffer({ ...editingOffer, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  placeholder="e.g., Elite Transformation"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Delivery Type *</label>
                <select
                  value={editingOffer.delivery_type}
                  onChange={(e) => setEditingOffer({ ...editingOffer, delivery_type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="one-on-one">1:1 Coaching</option>
                  <option value="group">Group Coaching</option>
                  <option value="async">Async Program</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Price ($) *</label>
                <input
                  type="number"
                  value={editingOffer.price}
                  onChange={(e) => setEditingOffer({ ...editingOffer, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  placeholder="997"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration (weeks) *</label>
                <input
                  type="number"
                  value={editingOffer.duration_weeks}
                  onChange={(e) => setEditingOffer({ ...editingOffer, duration_weeks: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  placeholder="12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={editingOffer.description}
                onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                placeholder="Brief description of what's included"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm text-gray-400">Features / What's Included *</label>
                <button
                  onClick={addFeature}
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Feature</span>
                </button>
              </div>
              <div className="space-y-2">
                {editingOffer.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      placeholder="e.g., Weekly 1:1 sessions"
                    />
                    <button
                      onClick={() => removeFeature(index)}
                      className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Image URL (Optional)</label>
              <input
                type="text"
                value={editingOffer.image_url}
                onChange={(e) => setEditingOffer({ ...editingOffer, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                placeholder="https://example.com/offer-image.png"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={editingOffer.is_featured}
                onChange={(e) => setEditingOffer({ ...editingOffer, is_featured: e.target.checked })}
                className="w-4 h-4 bg-dark-800 border-dark-700 rounded"
              />
              <label htmlFor="featured" className="text-sm text-gray-400">
                Mark as featured (shows "Most Popular" badge)
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-700">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingOffer(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveOffer(editingOffer)}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <div className="w-16 h-16 bg-dark-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No offers yet</h3>
          <p className="text-gray-400 mb-6">Create your first coaching package to get started</p>
          <button onClick={startNewOffer} className="btn-primary flex items-center space-x-2 mx-auto">
            <Plus className="w-4 h-4" />
            <span>Create Your First Offer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className="card-glass p-6 relative group">
              {offer.is_featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-blue px-3 py-1 rounded-full text-xs font-semibold text-white">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-blue rounded-lg flex items-center justify-center">
                  {offer.delivery_type === 'one-on-one' && <Users className="w-6 h-6 text-white" />}
                  {offer.delivery_type === 'group' && <Calendar className="w-6 h-6 text-white" />}
                  {offer.delivery_type === 'async' && <Zap className="w-6 h-6 text-white" />}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                  <button
                    onClick={() => startEditOffer(offer)}
                    className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => offer.id && handleDeleteOffer(offer.id)}
                    className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-primary-400 font-semibold mb-2 uppercase">
                {offer.delivery_type.replace('-', ' ')}
              </div>
              <div className="text-2xl font-bold text-white mb-1">{offer.name}</div>
              <div className="text-3xl font-bold gradient-text mb-4">${offer.price}</div>
              <div className="text-sm text-gray-400 mb-4">{offer.duration_weeks} weeks</div>

              <ul className="space-y-2">
                {offer.features.filter(f => f).slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                    <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white">✓</span>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {offer.features.filter(f => f).length > 4 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{offer.features.filter(f => f).length - 4} more features
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
