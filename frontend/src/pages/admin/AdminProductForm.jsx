import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { productAPI, categoryAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [imageUrls, setImageUrls] = useState([{ url: '', alt: '', isPrimary: true }])
  const [sizes, setSizes] = useState([])
  const [tags, setTags] = useState([])
  const [features, setFeatures] = useState([''])
  const [careInstructions, setCareInstructions] = useState([''])
  const [newSize, setNewSize] = useState('')
  const [newTag, setNewTag] = useState('')

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategories().then(r => r.data),
    staleTime: Infinity,
  })

  const { data: productData } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => productAPI.getProduct(id).then(r => r.data),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const isOnSale = watch('isOnSale')

  useEffect(() => {
    if (productData?.product) {
      const p = productData.product
      reset({
        name: p.name, description: p.description, shortDescription: p.shortDescription,
        category: p.category?._id, gender: p.gender, basePrice: p.basePrice,
        salePrice: p.salePrice, isOnSale: p.isOnSale, isNew: p.isNew,
        isFeatured: p.isFeatured, isBestseller: p.isBestseller, isActive: p.isActive !== false,
        stock: p.stock, material: p.material, brand: p.brand,
      })
      if (p.images?.length) setImageUrls(p.images)
      if (p.sizes?.length) setSizes(p.sizes)
      if (p.tags?.length) setTags(p.tags)
      if (p.features?.length) setFeatures(p.features)
      if (p.careInstructions?.length) setCareInstructions(p.careInstructions)
    }
  }, [productData, reset])

  const onSubmit = async (formData) => {
    setSaving(true)
    try {
      const payload = {
        ...formData,
        images: imageUrls.filter(i => i.url),
        sizes,
        tags,
        features: features.filter(Boolean),
        careInstructions: careInstructions.filter(Boolean),
        basePrice: Number(formData.basePrice),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        stock: Number(formData.stock || 0),
      }

      if (isEdit) {
        await productAPI.updateProduct(id, payload)
        toast.success('Product updated.')
      } else {
        await productAPI.createProduct(payload)
        toast.success('Product created.')
      }

      await qc.invalidateQueries(['admin-products'])
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.')
    } finally { setSaving(false) }
  }

  const F = ({ label, name, type='text', validation={}, half=false, placeholder='' }) => (
    <div className={half ? '' : 'md:col-span-2'}>
      <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} {...register(name, validation)}
        className={`input-luxury-box w-full text-sm ${errors[name] ? 'border-red-400' : ''}`} />
      {errors[name] && <p className="text-xs text-red-500 font-sans mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/products" className="text-obsidian-400 hover:text-gold-600 transition-colors"><ArrowLeft size={18}/></Link>
        <h1 className="font-display text-3xl">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Basic info */}
            <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <F label="Product Name *" name="name" validation={{ required: 'Name is required' }} />
                <F label="Brand" name="brand" half placeholder="Maison Luxe" />
                <div className="md:col-span-2">
                  <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Description *</label>
                  <textarea {...register('description', { required: 'Description is required' })} rows={4}
                    className={`input-luxury-box w-full text-sm resize-none ${errors.description ? 'border-red-400' : ''}`} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Short Description</label>
                  <input {...register('shortDescription')} className="input-luxury-box w-full text-sm" />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-4">Pricing & Inventory</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <F label="Base Price *" name="basePrice" type="number" half validation={{ required: 'Price is required', min: { value: 0, message: 'Must be positive' } }} />
                <F label="Stock Quantity" name="stock" type="number" half />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isOnSale" {...register('isOnSale')} className="accent-gold-500" />
                  <label htmlFor="isOnSale" className="text-sm font-sans cursor-pointer">On Sale</label>
                </div>
                {isOnSale && <F label="Sale Price" name="salePrice" type="number" half />}
              </div>
            </div>

            {/* Images */}
            <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-4">Product Images</h3>
              <div className="space-y-3">
                {imageUrls.map((img, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    {img.url && <img src={img.url} alt="" className="w-12 h-14 object-cover bg-cream flex-shrink-0" onError={e => e.target.style.display='none'} />}
                    <input value={img.url} onChange={e => {
                      const next = [...imageUrls]; next[i] = { ...next[i], url: e.target.value }; setImageUrls(next)
                    }} placeholder="https://..." className="input-luxury-box flex-1 text-sm" />
                    <label className="flex items-center gap-2 text-xs font-sans text-obsidian-500 flex-shrink-0 cursor-pointer">
                      <input type="radio" name="primaryImage" checked={img.isPrimary} onChange={() => {
                        setImageUrls(imageUrls.map((im,j) => ({ ...im, isPrimary: j === i })))
                      }} className="accent-gold-500" />
                      Primary
                    </label>
                    {imageUrls.length > 1 && (
                      <button type="button" onClick={() => setImageUrls(imageUrls.filter((_,j) => j !== i))} className="text-obsidian-300 hover:text-red-500 flex-shrink-0"><X size={14}/></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setImageUrls([...imageUrls, { url: '', isPrimary: false }])}
                  className="flex items-center gap-2 text-xs tracking-widest uppercase font-sans text-gold-600 hover:text-gold-700 transition-colors">
                  <Plus size={12}/> Add Image URL
                </button>
              </div>
            </div>

            {/* Sizes */}
            <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-4">Sizes</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {sizes.map(s => (
                  <span key={s} className="flex items-center gap-1.5 bg-obsidian text-white text-xs font-sans px-3 py-1.5">
                    {s}
                    <button type="button" onClick={() => setSizes(sizes.filter(x => x !== s))}><X size={10}/></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newSize} onChange={e => setNewSize(e.target.value.toUpperCase())} placeholder="e.g. M, 42"
                  className="input-luxury-box text-sm w-32" onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); if(newSize && !sizes.includes(newSize)){setSizes([...sizes,newSize]);setNewSize('')}}}} />
                <button type="button" onClick={() => { if(newSize && !sizes.includes(newSize)){setSizes([...sizes,newSize]);setNewSize('')}}} className="btn-outline text-xs py-2 px-4">Add</button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-4">Features & Care</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Key Features</label>
                  {features.map((f,i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={f} onChange={e => { const n=[...features]; n[i]=e.target.value; setFeatures(n) }}
                        className="input-luxury-box flex-1 text-sm" placeholder={`Feature ${i+1}`} />
                      <button type="button" onClick={() => setFeatures(features.filter((_,j)=>j!==i))} className="text-obsidian-300 hover:text-red-500"><X size={14}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setFeatures([...features,''])} className="text-xs text-gold-600 hover:text-gold-700 font-sans flex items-center gap-1"><Plus size={11}/>Add Feature</button>
                </div>
                <div>
                  <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-2">Material</label>
                  <input {...register('material')} className="input-luxury-box w-full text-sm" placeholder="100% Silk, Italian wool..." />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Publish */}
            <div className="bg-white p-5 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-4">Publish</h3>
              <div className="space-y-3">
                {[
                  { n: 'isActive', l: 'Active (visible in store)', defaultChecked: true },
                  { n: 'isNew', l: 'Mark as New Arrival' },
                  { n: 'isFeatured', l: 'Feature on Homepage' },
                  { n: 'isBestseller', l: 'Mark as Bestseller' },
                ].map(cb => (
                  <label key={cb.n} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" {...register(cb.n)} defaultChecked={cb.defaultChecked} className="accent-gold-500" />
                    <span className="text-sm font-sans text-obsidian-600">{cb.l}</span>
                  </label>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
                  {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                </button>
                <Link to="/admin/products" className="btn-outline w-full text-center block text-xs">Cancel</Link>
              </div>
            </div>

            {/* Category & type */}
            <div className="bg-white p-5 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-4">Classification</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Category *</label>
                  <select {...register('category', { required: 'Category is required' })} className="input-luxury-box w-full text-sm">
                    <option value="">Select category</option>
                    {categoriesData?.categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Gender</label>
                  <select {...register('gender')} className="input-luxury-box w-full text-sm">
                    {['women','men','unisex','kids'].map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white p-5 shadow-luxury border border-obsidian-50">
              <h3 className="font-display text-lg mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs font-sans bg-cream px-2.5 py-1">
                    {t} <button type="button" onClick={() => setTags(tags.filter(x=>x!==t))}><X size={10}/></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag..."
                  className="input-luxury-box text-sm flex-1"
                  onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();if(newTag&&!tags.includes(newTag)){setTags([...tags,newTag]);setNewTag('')}}}} />
                <button type="button" onClick={() => { if(newTag&&!tags.includes(newTag)){setTags([...tags,newTag]);setNewTag('')}}} className="btn-outline text-xs py-2 px-3">+</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
