import axios from './axios';
import type { Section, Content, Document, SectionFormData, ContentFormData, DocumentFormData } from '@/types/information';

const BASE_URL = '/information';

// ============================================================================
// PUBLIC API (Client)
// ============================================================================

/**
 * Get all active sections
 */
export async function getActiveSections(): Promise<Section[]> {
  const response = await axios.get(`${BASE_URL}/public/sections`);
  return response.data.data;
}

/**
 * Get section by slug
 */
export async function getSectionBySlug(slug: string): Promise<Section> {
  const response = await axios.get(`${BASE_URL}/public/sections/${slug}`);
  return response.data.data;
}

/**
 * Get contents for a section
 */
export async function getContentsBySection(sectionId: number): Promise<Content[]> {
  const response = await axios.get(`${BASE_URL}/public/sections/${sectionId}/contents`);
  return response.data.data;
}

/**
 * Get all active documents
 */
export async function getAllDocuments(): Promise<Document[]> {
  const response = await axios.get(`${BASE_URL}/public/documents`);
  return response.data.data;
}

/**
 * Get documents for a section
 */
export async function getDocumentsBySection(sectionId: number): Promise<Document[]> {
  const response = await axios.get(`${BASE_URL}/public/sections/${sectionId}/documents`);
  return response.data.data;
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(documentId: number): Promise<void> {
  await axios.post(`${BASE_URL}/public/documents/${documentId}/download`);
}

// ============================================================================
// ADMIN API
// ============================================================================

/**
 * Get all sections (admin)
 */
export async function getAllSections(): Promise<Section[]> {
  const response = await axios.get(`${BASE_URL}/admin/sections`);
  return response.data.data;
}

/**
 * Create section (admin)
 */
export async function createSection(data: SectionFormData): Promise<Section> {
  const response = await axios.post(`${BASE_URL}/admin/sections`, data);
  return response.data.data;
}

/**
 * Update section (admin)
 */
export async function updateSection(id: number, data: Partial<SectionFormData>): Promise<Section> {
  const response = await axios.put(`${BASE_URL}/admin/sections/${id}`, data);
  return response.data.data;
}

/**
 * Delete section (admin)
 */
export async function deleteSection(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/admin/sections/${id}`);
}

/**
 * Get all contents (admin)
 */
export async function getAllContents(): Promise<Content[]> {
  const response = await axios.get(`${BASE_URL}/admin/contents`);
  return response.data.data;
}

/**
 * Create content (admin)
 */
export async function createContent(data: ContentFormData): Promise<Content> {
  const response = await axios.post(`${BASE_URL}/admin/contents`, data);
  return response.data.data;
}

/**
 * Update content (admin)
 */
export async function updateContent(id: number, data: Partial<ContentFormData>): Promise<Content> {
  const response = await axios.put(`${BASE_URL}/admin/contents/${id}`, data);
  return response.data.data;
}

/**
 * Delete content (admin)
 */
export async function deleteContent(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/admin/contents/${id}`);
}

/**
 * Create document (admin)
 */
export async function createDocument(data: DocumentFormData): Promise<Document> {
  const response = await axios.post(`${BASE_URL}/admin/documents`, data);
  return response.data.data;
}

/**
 * Update document (admin)
 */
export async function updateDocument(id: number, data: Partial<DocumentFormData>): Promise<Document> {
  const response = await axios.put(`${BASE_URL}/admin/documents/${id}`, data);
  return response.data.data;
}

/**
 * Delete document (admin)
 */
export async function deleteDocument(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/admin/documents/${id}`);
}

// Helper function to format file size
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Export default object
const informationAPI = {
  getActiveSections,
  getSectionBySlug,
  getContentsBySection,
  getAllDocuments,
  getDocumentsBySection,
  incrementDownloadCount,
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  getAllContents,
  createContent,
  updateContent,
  deleteContent,
  createDocument,
  updateDocument,
  deleteDocument,
  formatFileSize,
};

export default informationAPI;
