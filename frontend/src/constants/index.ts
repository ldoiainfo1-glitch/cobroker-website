// Mandate types
export const MANDATE_TYPES = {
  buy: 'Buy',
  sell: 'Sell',
  lease: 'Lease',
  joint_venture: 'Joint Venture',
  investment: 'Investment',
} as const

export const PROPERTY_TYPES = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  land: 'Land',
  agricultural: 'Agricultural',
} as const

// Indian cities for dropdowns
export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali',
  'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad',
  'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
  'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai',
  'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur',
  'Hubballi-Dharwad', 'Mysuru', 'Tiruchirappalli',
]

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Jammu & Kashmir', 'Ladakh',
]

export const AREA_UNITS = ['sq.ft', 'sq.m', 'sq.yd', 'acre', 'gunta', 'hectare'] as const

export const ROLES = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  director: 'Director',
  broker: 'Broker',
  employee: 'Employee',
  viewer: 'Viewer',
} as const

export const VERIFICATION_STATUS = {
  unverified: 'Unverified',
  pending: 'Pending Review',
  under_review: 'Under Review',
  verified: 'Verified',
  rejected: 'Rejected',
} as const
