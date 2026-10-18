// Catalogue IDs and labels are authoritative; never substitute historical seeds.
export const patientPhotoAlbums = (photos = [], catalogue = [], patientID) => {
  const albums = new Map();
  for (const album of catalogue) {
    if (album.albumCategoryListID == null) {
      continue;
    }
    const id = String(album.albumCategoryListID);
    albums.set(id, {
      albumCategoryListID: id,
      albumCategoryName: album.albumCategoryName || `Album ${id}`,
      patientID,
      photoPath: null,
      photoDetails: null,
      photoCount: 0,
    });
  }
  for (const photo of photos) {
    if (photo.albumCategoryListID == null) {
      continue;
    }
    const id = String(photo.albumCategoryListID);
    if (!albums.has(id)) {
      albums.set(id, {
        albumCategoryListID: id,
        albumCategoryName: photo.albumCategoryName || `Album ${id}`,
        patientID,
        photoCount: 0,
      });
    }
    const album = albums.get(id);
    album.photoCount += 1;
    if (
      album.patientPhotoID == null ||
      Number(photo.patientPhotoID) > Number(album.patientPhotoID)
    ) {
      album.patientPhotoID = photo.patientPhotoID;
      album.photoPath = photo.photoPath || null;
      album.photoDetails = photo.photoDetails || null;
    }
  }
  return [...albums.values()];
};
