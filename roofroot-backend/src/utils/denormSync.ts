import Listing from '../models/Listings';
import Agency from '../models/Agencies';
import Property from '../models/Properties';

export async function syncAgencyNameDenorm(agencyId: string, newName: string): Promise<void> {
  try {
    await Listing.updateMany(
      { agencyId },
      { 'denorm.agencyName': newName }
    );
    console.log(`Synced agency name denorm for agency ${agencyId}`);
  } catch (error) {
    console.error(`Failed to sync agency name denorm for agency ${agencyId}:`, error);
  }
}

export async function syncPropertyTitleDenorm(propertyId: string, newTitle: string): Promise<void> {
  try {
    await Listing.updateMany(
      { propertyId },
      { 'denorm.propertyTitle': newTitle }
    );
    console.log(`Synced property title denorm for property ${propertyId}`);
  } catch (error) {
    console.error(`Failed to sync property title denorm for property ${propertyId}:`, error);
  }
}

export async function syncListingDenorm(listingId: string): Promise<void> {
  try {
    const listing = await Listing.findById(listingId)
      .populate('agencyId', 'name')
      .populate('propertyId', 'title');
    
    if (!listing) return;
    
    const updates: any = {};
    
    if (listing.agencyId && (listing.agencyId as any).name) {
      updates['denorm.agencyName'] = (listing.agencyId as any).name;
    }
    
    if (listing.propertyId && (listing.propertyId as any).title) {
      updates['denorm.propertyTitle'] = (listing.propertyId as any).title;
    }
    
    if (Object.keys(updates).length > 0) {
      await Listing.findByIdAndUpdate(listingId, updates);
      console.log(`Synced denorm data for listing ${listingId}`);
    }
  } catch (error) {
    console.error(`Failed to sync denorm data for listing ${listingId}:`, error);
  }
}

export async function bulkSyncAllDenorm(): Promise<void> {
  try {
    console.log('Starting bulk denorm sync...');
    
    // Get all listings with populated references
    const listings = await Listing.find()
      .populate('agencyId', 'name')
      .populate('propertyId', 'title');
    
    let updatedCount = 0;
    
    for (const listing of listings) {
      const updates: any = {};
      
      if (listing.agencyId && (listing.agencyId as any).name) {
        updates['denorm.agencyName'] = (listing.agencyId as any).name;
      }
      
      if (listing.propertyId && (listing.propertyId as any).title) {
        updates['denorm.propertyTitle'] = (listing.propertyId as any).title;
      }
      
      if (Object.keys(updates).length > 0) {
        await Listing.findByIdAndUpdate(listing._id, updates);
        updatedCount++;
      }
    }
    
    console.log(`Bulk denorm sync completed. Updated ${updatedCount} listings.`);
  } catch (error) {
    console.error('Bulk denorm sync failed:', error);
  }
}
