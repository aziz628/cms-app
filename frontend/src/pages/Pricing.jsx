import {useState,useEffect} from 'react';
import FormBuilder from '../components/common/FormBuiler';
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools';
import { useNotification } from '../context/NotificationContext';
import pricingService from '../services/pricingService.js';
import {
  createpricingPlanSchema,
  updatepricingPlanSchema,
  addFeatureSchema,
  updateFeatureSchema
} from '../validation/schemas/PricingSchema.js';
 
function Pricing() {
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingFeature,setEditingFeature] = useState(null)
  const [newFeature, setNewFeature] = useState({planId:null, feature:''})
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const { success, error } = useNotification();

  useBodyOverflow(showDeleteModal);
  const fetchPricingPlans = async () => {
    setLoading(true);
    try {
      const plans = await pricingService.getAllPlans();
      setPricingPlans(plans);
    } catch (err) {
      error("Failed to fetch pricing plans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPricingPlans();
  }, []);
  useEffect(() => {
    if (showModal) {
      const formElement = document.getElementById("form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [showModal]);
 
  const closeModal = () => {
    setShowModal(false);    // Hide modal
    setEditingPlan(null);    // Clear editing data
  };
  const openModal = (plan=null) => {
    setEditingPlan(plan);
    setShowModal(true);
  };
  const handleSavePlan = async (data) => {
    setLoading(true);
    try {
      if (editingPlan) {
        await pricingService.updatePlan(editingPlan.id, data);
        fetchPricingPlans(); // Refresh list to show updates
        success("Pricing plan updated successfully");
      } else {
        await pricingService.createPlan(data);
        success("Pricing plan created successfully");
        fetchPricingPlans(); // Refresh list to include new plan
      }
    } catch (err) {
      error("Failed to save pricing plan");
      console.error(err);
    } finally {
      closeModal();
      setLoading(false);
    }
  };
  const saveFeature=async ()=>{
    try{
      if(editingFeature){
        // Validate the edited feature using the schema
        const isValid = updateFeatureSchema.validate(editingFeature);
        if(!isValid) return error('Invalid feature data');

        await pricingService.editFeature(editingFeature.id,{feature:editingFeature.feature})
        success('Feature updated successfully')
      }else{
        // Validate the new feature using the schema
        const isValid = addFeatureSchema.validate(newFeature);
        if(!isValid) return error('Invalid feature data');
        
        await pricingService.addFeature(newFeature.planId,{feature:newFeature.feature})
        success('Feature added successfully')
      }
      fetchPricingPlans()
    }catch(err){
      error('failed to save feature')
      console.error(err)
    }finally{
      setEditingFeature(null)
      setNewFeature({planId:null, feature:''})
    }
  }
  const deleteFeature=async(id)=>{
    try{
      await pricingService.deleteFeature(id)
      fetchPricingPlans()
    }catch(err){
      error('failed to delete feature')
      console.error(err)
    }finally{
      setEditingFeature(null)
    }
  }
  const openDeleteModal = (id) => {
    setDeletingPlanId(id);
    setShowDeleteModal(true);
  }
  const closeDeleteModal = () => {
    setDeletingPlanId(null);
    setShowDeleteModal(false);
  }
  const handleDeletePlan = async () => {
    if (!deletingPlanId) return;
    setLoading(true);
    try {
      await pricingService.deletePlan(deletingPlanId);
      setPricingPlans((prev) => prev.filter((p) => p.id !== deletingPlanId  ));
      success("Pricing plan deleted successfully");
    } catch (err) {
      error("Failed to delete pricing plan");
      console.error(err);
    } finally {
      closeDeleteModal();
      setLoading(false);
    }
  };
  return (
    <div className='space-y-4'>
       <div className='flex flex-col md:flex-row gap-4 md:justify-between items-center '>
          <h2 className="text-2xl font-bold mb-4">Pricing Plans</h2>
            <button type='button'
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              onClick={()=>openModal(null)}
            ><i className="fa-solid fa-plus mr-2"></i>
            Add pricing Plan
            </button>
      </div>
      <div id='categories-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg space-y-4'>
        <h2 className='text-xl font-semibold'>Pricing Plans list</h2>
        <div>
          {loading 
            ? (
              <div className="flex bg-red justify-center items-center h-64">
                  <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )
            : (
              pricingPlans.length == 0 
              ? (
                <p className='text-gray-500'>No Pricing Plans found</p>
              ):
              (
                <div className="overflow-x-auto">{/* this time it's not a table but list of cards */}
                  <div className="flex flex-wrap gap-4">
                    {pricingPlans?.map((plan) => (
                      <div key={plan.id} className="text-center w-[260px] flex flex-col rounded-lg border border-primary shadow-lg">

                        <div id='plan-header' className='border h-[150px] space-y-2 rounded-t-lg flex-col bg-primary p-4 text-white justify-between items-center'>
                          <h3 className="text-lg font-bold">{plan.name?.toUpperCase()}</h3>
                          <div className='space-x-2'>{/* show price and currency */}
                            <span className='text-white font-bold text-[30px]'>${plan.price}</span>
                            <span className='text-white font-semibold text-md'>/ {{'daily':'day', 'weekly':'week', 'monthly':'month', 'annually':'year'}[plan.period]|| 'unknown'}</span>
                          </div>
                          <p className='text-sm  '>{plan.description}</p>
                        </div>

                        <div id='plan-body ' className='p-4 gap-6  flex flex-1 flex-col justify-between rounded-b-lg '>
                          <ul className='space-y-1 text-left'>
                            {plan.features?.map((feature,i) => (
                              /* Render feature as editable input if being edited */
                              editingFeature && editingFeature.id== feature.id ? (
                              <div key={i} className='space-y-2'>
                                <input className='input' type='text' onChange={(e)=>{setEditingFeature({...editingFeature, feature:e.target.value})}} value={editingFeature.feature}></input>
                                <div className='space-x-2 flex'>
                                  <button className='bg-white border-2 border-green-600 hover:bg-green-700 hover:text-white text-green-600 px-3 py-1 rounded flex items-center' type='button' onClick={()=>saveFeature()}><i className="fa-solid fa-check"></i></button>
                                  <button className='bg-white border-2 border-red-600 hover:bg-red-700 hover:text-white text-red-600 px-3 py-1 rounded flex items-center'  type='button' onClick={()=>{setEditingFeature(null)}}>
                                    <i className="fa-solid fa-xmark"></i></button>
                                </div>
                              </div>
                              )
                              /* Otherwise, render as normal list item */
                              :( <li key={i} style={{borderTop: i === 0 ? 'none' : '1px solid grey'}} className={'text-sm py-1  flex justify-between items-center'}>
                                <p className='space-x-1'>
                                <i style={{color:'green'}} className="fa-solid fa-check"></i>
                                <span>{feature.feature.charAt(0).toUpperCase() + feature.feature.slice(1)}</span>
                                </p>
                                <div className='space-x-2 flex'>
                                  <button onClick={()=>{setEditingFeature(feature)}}  
                                    type='button' 
                                    className=' px-2 py-1 rounded flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-[2px]'>
                                    <i className="fa-solid fa-pen-to-square "></i>
                                    </button>
                                   <button onClick={()=>deleteFeature(feature.id)} type='button' className=' px-2 py-1 rounded flex items-center justify-center  bg-red-600 hover:bg-red-700 text-white p-[2px]'> 
                                    <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                </li>
                              )
                            ))}
                            { (newFeature && newFeature.planId === plan.id) && 
                              <div className='space-y-1 ' style={{margin: '20px 0'}}>
                                <input className='input' type="text" onChange={(e) => setNewFeature({ ...newFeature, feature: e.target.value })} />
                                <div className='space-x-2 flex'>
                                  <button className='bg-white border-2 border-green-600 hover:bg-green-700 hover:text-white text-green-600 px-3 py-1 rounded flex items-center' type='button' onClick={saveFeature}>
                                    <i className="fa-solid fa-check"></i></button>
                                  <button className='bg-white border-2 border-red-600 hover:bg-red-700 hover:text-white text-red-600 px-3 py-1 rounded flex items-center' type='button' onClick={()=>{setNewFeature({planId:null, feature:''})}}>
                                    <i className="fa-solid fa-xmark"></i></button>
                                </div>
                              </div>
                          }
                          </ul>
                          {/* Add New Feature */}
                          <div className='flex flex-col space-y-2'>
                            <button onClick={() => setNewFeature({planId: plan.id, feature: '' })} className='text-primary rounded py-1 border border-primary hover:bg-secondary hover:text-white' type='button'>
                            <i className="fa-solid fa-plus mr-2"></i>
                            Add feature</button>
                          
                          <div className='mt-4 flex text-sm justify-between'>
                            <button 
                              className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center'
                              onClick={() => openModal(plan)}
                            >
                              <i className="fa-solid fa-pen-to-square mr-2"></i>
                              Edit Plan
                            </button>
                            <button
                              className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center'
                              onClick={() => openDeleteModal(plan.id)}
                            >
                              <i className="fa-solid fa-trash mr-2"></i>
                              Delete Plan
                            </button>
                          </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            )
          )
          }
        </div>
    </div>
    {showModal && <div id='form'>
      <FormBuilder
        title={editingPlan ? "Edit Pricing Plan" : "Add Pricing Plan"}
        fields={[
          { name: 'name', label: 'Plan Name', type: 'text',  required:true},
          { name: 'description', label: 'Description', type: 'textarea'  }, 
          { name: 'price', label: 'Price ($)', type: 'number',required:true },
          { name: 'period', label: 'Billing Period', type: 'select', options: [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'annually', label: 'Annually' },
          ],required:true}
        ]}
        schema={editingPlan ? updatepricingPlanSchema : createpricingPlanSchema}
        initialData={ editingPlan 
          ? (() => {
            const { id: _, ...rest } = editingPlan;
            return rest;
          })() 
          :  { name: '', description: '', price: '', period: 'daily' }}
        validationMode={editingPlan ? 'edit' : 'create'}
        onSubmit={handleSavePlan}
        onClose={closeModal}
        useFormData={false}
      />
    </div>
    }  
    {showDeleteModal && (
      <div> 
        <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <DeleteModal
            title="Delete Pricing Plan"
            onConfirm={handleDeletePlan}
            onCancel={closeDeleteModal}
          />
        </div>
      </div>
    )}
  </div>
  );
}

export default Pricing