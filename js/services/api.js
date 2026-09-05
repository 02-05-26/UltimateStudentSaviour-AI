/**
 * Client-side API service for UltimateStudentSaviour AI
 * Securely communicates with the backend /api/generate-projects endpoint.
 * Includes in-flight request protection, lightweight caching, and client validation.
 */

let isRequestPending = false;
const CACHE_KEY_PREFIX = 'uss_ai_cache_';

export const validateClientProfile = (profile) => {
    if (!profile.interests || !Array.isArray(profile.interests) || profile.interests.length === 0) {
        return { valid: false, message: "Choose at least one interest so we can personalize your project ideas." };
    }
    if (!profile.experience) {
        return { valid: false, message: "Please select your experience level (Beginner, Intermediate, or Advanced)." };
    }
    if (!profile.complexity) {
        return { valid: false, message: "Please select your preferred project complexity (Simple, Moderate, or Challenging)." };
    }
    if (!profile.projectType) {
        return { valid: false, message: "Please select your preferred project type (Individual, Team, or Either)." };
    }
    return { valid: true };
};

export const generateProjectsApi = async (profile) => {
    // 1. Client validation
    const validation = validateClientProfile(profile);
    if (!validation.valid) {
        throw new Error(validation.message);
    }

    // 2. Prevent duplicate concurrent submissions
    if (isRequestPending) {
        throw new Error("A project generation request is already in progress. Please wait a moment.");
    }

    // 3. Lightweight cache check
    const cacheKey = CACHE_KEY_PREFIX + JSON.stringify({
        interests: [...profile.interests].sort(),
        skills: [...(profile.skills || [])].sort(),
        experience: profile.experience,
        complexity: profile.complexity,
        projectType: profile.projectType,
        customPreferences: (profile.customPreferences || '').trim().toLowerCase()
    });

    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
                return { ...parsed, fromCache: true };
            }
        }
    } catch (e) {
        // Ignore cache storage errors
    }

    isRequestPending = true;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        const response = await fetch('/api/generate-projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            throw new Error("Unable to parse server response. Please try again.");
        }

        if (!response.ok || !data.success) {
            const errorMsg = data && data.error ? data.error : "Project generation is temporarily unavailable. Please try again.";
            throw new Error(errorMsg);
        }

        // Cache successful response
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {}

        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error("The request timed out while generating your project recommendations. Please try again.");
        }
        throw error;
    } finally {
        isRequestPending = false;
    }
};

export const getApiPendingStatus = () => isRequestPending;

const pendingOperations = new Set();
export const projectOperationApi = async (endpoint, payload) => {
    if (pendingOperations.has(endpoint)) throw new Error('This request is already in progress.');
    pendingOperations.add(endpoint);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
        clearTimeout(timeout);
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.success) throw new Error(body.error || 'The operation could not be completed. Please retry.');
        return body.data;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('The operation timed out. Please retry.');
        throw error;
    } finally { pendingOperations.delete(endpoint); }
};
