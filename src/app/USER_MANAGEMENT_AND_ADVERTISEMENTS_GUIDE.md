# User Management & Advertisements - Complete Guide

## 📋 Table of Contents
1. [User Management System](#user-management-system)
2. [Role-Based Access Control](#role-based-access-control)
3. [Advertisement System](#advertisement-system)
4. [Integration Guide](#integration-guide)

---

## 🔐 User Management System

### Overview
The User Management system allows administrators to create and manage staff accounts with different roles and permissions. Each user receives auto-generated credentials via email and must change their password on first login.

### Accessing User Management

**From Navigation:**
- Click "User Management" in the top navigation bar
- Only visible to users with `manageUsers` permission (Admins by default)

### Key Features

#### 1. **User Dashboard**
View all staff accounts with quick statistics:
- **Total Users**: Count of all accounts
- **Active**: Users currently able to login
- **Pending**: Accounts created but user hasn't logged in yet
- **Inactive**: Disabled accounts

#### 2. **User Table**
Comprehensive view showing:
- Name and Email
- Role (with color-coded badges)
- Status (Active/Inactive/Pending)
- Temporary Password indicator
- Actual password (with show/hide toggle)
- Property access level
- Creation date
- Last login date
- Quick actions (Edit permissions, Toggle status, Delete)

### Creating a New User

**Step 1: Click "Add User"**
- Opens the Create User dialog
- Form requires essential information

**Step 2: Fill Required Fields**

**Full Name** *
- User's complete name
- Example: "John Smith"

**Email Address** *
- Valid email where credentials will be sent
- Example: "john@example.com"
- Must be unique (no duplicate emails)

**Role** *
Choose from 4 roles:
1. **Admin** - Full Access
   - Can do everything including user management
   
2. **Manager** - Property Management
   - Manages properties, tenants, and payments
   - Cannot manage users or delete critical data
   
3. **Caretaker** - Unit Maintenance
   - Limited to assigned properties only
   - Manages units and maintenance
   - No access to financial data
   
4. **Accountant** - Financial Only
   - Handles payments and reports
   - Can view all properties
   - Cannot modify tenant or unit data

**Step 3: Assign Properties (For Caretaker role)**
- If role has limited property access
- Select which properties this user can see
- Must select at least one property
- Admins and Managers see all properties automatically

**Step 4: Review Permissions**
- Preview of default permissions for selected role
- Green dot = Permission granted
- Red dot = Permission denied
- Can be customized after creation

**Step 5: Create & Send Email**
- Click "Create User & Send Email"
- System generates random secure password
- Email is automatically sent (simulated in this demo)
- Alert shows the temporary password
- Check browser console for email preview

### Password System

#### Auto-Generated Passwords
- **Length**: 12 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, and symbols
- **Example**: `Xk9mPq3#Hy2L`
- **Excluded**: Confusing characters (0, O, I, l)

#### Email Format
```
Subject: Welcome to Property Management System

Hello,

An account has been created for you in the Property Management System.

Your login credentials:
Email: [user email]
Temporary Password: [generated password]

Please login and change your password immediately.

Login at: [Your App URL]

Best regards,
Property Management Team
```

#### First Login Process
1. User receives email with credentials
2. User logs in with temporary password
3. System detects `tempPassword: true`
4. Forces password change
5. New password must be different
6. After change, `tempPassword: false`

### Managing User Permissions

**Edit Permissions:**
1. Click shield icon (🛡️) in user row
2. Opens Edit Permissions dialog
3. Toggle switches for each permission
4. Assign/remove properties if needed
5. Click "Save Permissions"

**Available Permissions:**

| Permission | Description |
|------------|-------------|
| View Dashboard | Access to main dashboard and statistics |
| Manage Tenants | Add, edit, and remove tenants |
| Manage Payments | Process payments and view payment history |
| Manage Units | Edit unit details, rent, and charges |
| View Financial Reports | Access financial analytics and reports |
| Manage Users | Create and manage staff accounts (Admin only) |
| Manage Advertisements | Create and publish property listings |
| View All Properties | Access all properties (vs assigned only) |
| Delete Data | Permission to delete records (use with caution) |
| Export Data | Download reports and export data to CSV |

**Property Assignment:**
- Only relevant if "View All Properties" is OFF
- Select specific properties user can access
- User will only see data for assigned properties
- Useful for caretakers managing specific buildings

### User Status Management

**Active Status:**
- User can login normally
- All permissions apply
- Can perform assigned tasks

**Inactive Status:**
- User cannot login
- Account suspended temporarily
- Data preserved for later reactivation
- Use instead of deletion when temporary

**Pending Status:**
- Account created but user hasn't logged in yet
- Temporary password still active
- Automatically changes to "Active" on first login

**Toggle Status:**
- Click the ✓ (active) or ✗ (inactive) icon
- Instant activation/deactivation
- No confirmation needed
- Can toggle back anytime

### Deleting Users

**Warning:** This action cannot be undone!

**Process:**
1. Click trash icon (🗑️)
2. Confirmation dialog appears
3. Confirm to permanently delete
4. User and all associated permissions removed

**When to Delete:**
- Employee left the company
- Account created by mistake
- Duplicate account

**When NOT to Delete:**
- Temporary leave (use Inactive instead)
- Audit trail needed
- Historical data references this user

---

## 👥 Role-Based Access Control

### Role Hierarchy

```
Admin (Highest Access)
  ├── Full system control
  ├── User management
  ├── All properties
  └── Delete permissions

Manager
  ├── Property & tenant management
  ├── Financial operations
  ├── All properties
  └── No user management

Accountant
  ├── Financial data only
  ├── Payment processing
  ├── Reports and exports
  └── View-only for properties

Caretaker (Most Restricted)
  ├── Unit maintenance only
  ├── Assigned properties only
  ├── No financial access
  └── Limited reporting
```

### Default Permissions Matrix

| Permission | Admin | Manager | Accountant | Caretaker |
|------------|-------|---------|------------|-----------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage Tenants | ✅ | ✅ | ❌ | ❌ |
| Manage Payments | ✅ | ✅ | ✅ | ❌ |
| Manage Units | ✅ | ✅ | ❌ | ✅ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Manage Ads | ✅ | ✅ | ❌ | ❌ |
| View All Properties | ✅ | ✅ | ✅ | ❌ |
| Delete Data | ✅ | ❌ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ✅ | ❌ |

### Testing Role-Based Access

**Scenario 1: Caretaker Access**
1. Create caretaker account
2. Assign only "Sunset Apartments"
3. Login as caretaker
4. Should ONLY see:
   - Sunset Apartments units
   - Maintenance tasks for that property
   - Dashboard (limited view)
5. Should NOT see:
   - Other properties
   - Financial reports
   - User management
   - Payment history

**Scenario 2: Manager Access**
1. Create manager account
2. Full property access automatic
3. Login as manager
4. Can manage all properties and tenants
5. Cannot access User Management page
6. Cannot delete apartments or critical data

**Scenario 3: Accountant Access**
1. Create accountant account
2. Login as accountant
3. Can see all payments and reports
4. Cannot add/edit tenants
5. Cannot modify unit details
6. Can export financial data

---

## 📢 Advertisement System

### Overview
Create professional property listings to market vacant units and attract tenants. Includes image galleries, detailed descriptions, amenities, and preview functionality.

### Accessing Advertisements

**From Navigation:**
- Click "Advertisements" in top navigation bar
- Available to users with `manageAdvertisements` permission
- Default: Admins and Managers

### Advertisement Dashboard

**Quick Statistics:**
- **Total Ads**: All advertisements created
- **Published**: Live listings visible to public
- **Drafts**: Unpublished, work-in-progress listings
- **Total Views**: Combined views across all ads
- **Inquiries**: Number of contact requests

**Filter Options:**
- All: Show everything
- Published: Only live listings
- Drafts: Only unpublished listings

### Creating an Advertisement

**Step 1: Click "Create Advertisement"**

**Step 2: Fill Property Details**

**Property Title** * (Required)
- Catchy, descriptive title
- Examples:
  - "Luxury 3-Bedroom Apartment"
  - "Modern Studio in City Center"
  - "Spacious Family Home with Garden"

**Description** * (Required)
- Detailed property description
- Highlight key features
- Mention nearby amenities
- Include unique selling points
- Recommended: 100-300 words

**Property Type** * (Required)
- Apartment
- House
- Studio
- Commercial

**Location** * (Required)
- Specific area or neighborhood
- Include landmarks if relevant
- Examples:
  - "Downtown, City Center"
  - "Midtown near Metro Station"
  - "Suburbs, Quiet Residential Area"

**Bedrooms** (Optional)
- Number of bedrooms
- 0 for studio apartments
- Leave blank for commercial

**Bathrooms** (Optional)
- Number of bathrooms
- Can use decimals (e.g., 2.5)

**Price** * (Required)
- Numeric value only
- Currency symbol added automatically
- Example: 2500

**Price Type** * (Required)
- Monthly Rent
- Yearly Rent
- For Sale

**Step 3: Add Images**

**Adding Images:**
1. Paste image URL in input field
2. Click "Add" or press Enter
3. Image appears in gallery
4. First image = Main/Featured image
5. Add up to 10+ images

**Image Tips:**
- Use high-quality photos
- Good lighting
- Multiple angles
- Show key features
- Include exterior shots
- Add amenity photos

**Removing Images:**
- Hover over image
- Click ✗ button in top-right
- Confirms immediately

**Rearranging:**
- First image is always featured
- To change: remove and re-add in desired order

**Step 4: Select Amenities**

**Available Amenities:**
- Parking
- Gym
- Pool
- Security
- Elevator
- Balcony
- Garden
- WiFi
- Furnished
- Air Conditioning
- Heating
- Pet Friendly
- Laundry
- Storage
- Utilities Included

**Selecting:**
- Click checkbox for each amenity
- Select all that apply
- Appears as tags in listing
- Helps potential tenants filter

**Step 5: Choose Status**

**Save as Draft:**
- Not visible to public
- Can edit anytime
- Perfect for incomplete listings
- No views/inquiries tracked yet

**Publish Immediately:**
- Goes live instantly
- Visible to potential tenants
- Starts tracking views and inquiries
- Can unpublish later if needed

**Step 6: Preview Before Publishing**

**Click "Preview" Button:**
- See how listing will appear
- Full-screen preview
- Check all details
- Verify images display correctly
- Test on different screen sizes

**In Preview:**
- Professional layout
- Image gallery
- All property details
- Amenities list
- Contact buttons (simulated)
- Share functionality

**Step 7: Submit**

**From Preview:**
- "Back to Edit" - Make changes
- "Save as Draft" - Store for later
- "Publish" - Go live immediately

**After Submission:**
- Returns to dashboard
- New ad appears in list
- Status badge shows draft/published
- Can edit or delete anytime

### Managing Advertisements

**Advertisement Card Shows:**
- Main image
- Status badge
- Title and description
- Property type
- Bedroom/bathroom count
- Location
- Price
- View count
- Inquiry count
- Action buttons

**Available Actions:**

**👁 Preview**
- See full listing view
- Same as public sees
- Check before publishing
- Verify all details

**🔗 Share**
- Copy listing details
- Share on social media (if supported)
- Send to potential tenants
- Marketing purposes

**Publish/Unpublish**
- Toggle listing visibility
- Published → Draft (hide listing)
- Draft → Published (make visible)
- Instant effect

**🗑 Delete**
- Permanently remove listing
- Requires confirmation
- Cannot be undone
- Use unpublish for temporary removal

### Advertisement Analytics

**Views:**
- Number of times listing opened
- Tracked automatically
- Resets on republish
- Helps measure interest

**Inquiries:**
- Contact form submissions
- Phone call requests
- Email inquiries
- Shows genuine interest level

**Status:**
- **Published**: 🟢 Green badge
- **Draft**: ⚪ Gray badge
- **Archived**: 🔴 Red badge

### Preview Mode

**Full Listing View:**
- Hero image gallery
- 3 thumbnail images
- Property details card
- Full description
- Amenities grid
- Statistics box
- Contact sidebar (demo)
- Share buttons

**Contact Sidebar Includes:**
- "Contact Agent" button
- "Send Message" button
- "Share Listing" button
- Disclaimer note

**Features:**
- Responsive design
- Mobile-friendly
- Print-friendly
- Professional appearance

---

## 🔗 Integration Guide

### How Systems Work Together

**User Permissions → Features:**
```
User Role (Admin)
  ↓
Permissions Set (All True)
  ↓
Navigation Shows All Options
  ↓
Can Access All Features
```

**Property Access Control:**
```
Caretaker Created
  ↓
Assigned to "Sunset Apartments"
  ↓
Dashboard Filters Data
  ↓
Only Shows Assigned Property
  ↓
All Features Scope to That Property
```

### Implementation in Your App

**1. Login Check:**
```typescript
// When user logs in
if (user.tempPassword) {
  // Force password change
  showPasswordChangeDialog();
}
```

**2. Permission Check:**
```typescript
// Before showing feature
if (currentUser.permissions.manageUsers) {
  // Show User Management link
}
```

**3. Property Filter:**
```typescript
// Filter data by user access
const visibleApartments = currentUser.permissions.viewAllProperties
  ? allApartments
  : allApartments.filter(apt => 
      currentUser.assignedProperties.includes(apt.id)
    );
```

**4. Action Authorization:**
```typescript
// Before allowing delete
if (!currentUser.permissions.deleteData) {
  alert("You don't have permission to delete this data");
  return;
}
```

### Best Practices

**User Management:**
✅ DO:
- Review permissions carefully
- Use least privilege principle
- Assign specific properties to caretakers
- Keep admin accounts minimal
- Audit user activities
- Deactivate instead of deleting when possible
- Document permission changes

❌ DON'T:
- Give everyone admin access
- Share account credentials
- Leave temp passwords unchanged
- Assign all permissions to non-admins
- Delete users with activity history
- Ignore pending accounts

**Advertisements:**
✅ DO:
- Use high-quality images
- Write detailed descriptions
- Update pricing regularly
- Unpublish when unit rented
- Track view/inquiry patterns
- Test on mobile devices
- Include all amenities

❌ DON'T:
- Use low-quality photos
- Publish incomplete listings
- Forget to update availability
- Leave outdated prices
- Skip property details
- Ignore inquiries
- Duplicate listings

### Security Considerations

**Password Security:**
- Passwords stored in state (in production, use encrypted database)
- Change on first login mandatory
- Complex password requirements
- No password reuse

**Email Security:**
- Currently simulated (console.log)
- In production: use email service (SendGrid, AWS SES)
- Include unsubscribe link
- Encrypt credentials in transit

**Permission Security:**
- Check on every action
- Don't trust client-side only
- Validate on backend (when implemented)
- Log permission changes

**Data Access:**
- Filter data by permissions
- Hide restricted features from UI
- Validate property access
- Audit data access patterns

### Testing Checklist

**User Management:**
- [ ] Create admin user
- [ ] Create manager user
- [ ] Create caretaker with limited properties
- [ ] Create accountant user
- [ ] Test permission editing
- [ ] Test status toggle
- [ ] Test user deletion
- [ ] Verify email simulation
- [ ] Check password visibility toggle
- [ ] Test property assignment

**Advertisements:**
- [ ] Create draft ad
- [ ] Add multiple images
- [ ] Select amenities
- [ ] Preview before publish
- [ ] Publish advertisement
- [ ] Unpublish advertisement
- [ ] Edit existing ad
- [ ] Delete advertisement
- [ ] Test share functionality
- [ ] Verify responsive layout

**Role-Based Access:**
- [ ] Login as different roles
- [ ] Verify navigation options
- [ ] Test feature restrictions
- [ ] Check property filtering
- [ ] Validate permission checks
- [ ] Test unauthorized access attempts

## 📞 Support & Troubleshooting

**Common Issues:**

**Q: Email not received?**
A: Currently using console.log simulation. Check browser console for email preview. In production, integrate real email service.

**Q: Can't see User Management?**
A: Only users with `manageUsers` permission can access. Check your role permissions.

**Q: Caretaker sees all properties?**
A: Check "View All Properties" permission is OFF and properties are assigned correctly.

**Q: Advertisement images not showing?**
A: Verify image URLs are valid and accessible. Use direct image links, not page URLs.

**Q: How to reset user password?**
A: Delete and recreate user, or implement password reset feature.

**Q: Can users change their own role?**
A: No. Only users with `manageUsers` permission can modify roles.

---

## 🎯 Summary

You now have:
✅ **Complete user management system** with 4 roles
✅ **Auto-generated passwords** sent via email (simulated)
✅ **Role-based access control** with 10 permissions
✅ **Property-level access** restriction
✅ **Professional advertisement system** with preview
✅ **Image gallery support** for listings
✅ **View and inquiry tracking** for ads
✅ **Share functionality** for marketing
✅ **Full integration** with existing features

The system is ready for real-world use with proper email integration and backend security!
