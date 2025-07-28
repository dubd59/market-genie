// Temporary mock client for development
// Replace with actual Supabase when environment variables are configured

const createMockClient = () => {
  return {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          then: (callback) => {
            // Mock data based on table
            let mockData = [];
            if (table === 'campaigns') {
              mockData = [
                {
                  id: 1,
                  name: 'Welcome Series',
                  status: 'active',
                  health_score: 85,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ];
            }
            return callback({ data: mockData, error: null });
          }
        }),
        then: (callback) => {
          let mockData = [];
          if (table === 'campaigns') {
            mockData = [
              {
                id: 1,
                name: 'Welcome Series',
                status: 'active',
                health_score: 85,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              {
                id: 2,
                name: 'Product Launch',
                status: 'paused',
                health_score: 72,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ];
          }
          return callback({ data: mockData, error: null });
        }
      }),
      insert: (data) => ({
        then: (callback) => callback({ data: [{ ...data, id: Date.now() }], error: null })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          then: (callback) => callback({ data: [data], error: null })
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          then: (callback) => callback({ data: [], error: null })
        })
      })
    }),
    auth: {
      getUser: () => Promise.resolve({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'demo@marketgenie.ai',
            user_metadata: {
              full_name: 'Demo User'
            }
          }
        },
        error: null
      }),
      signInWithPassword: ({ email, password }) => Promise.resolve({
        data: {
          user: {
            id: 'mock-user-id',
            email: email,
            user_metadata: {
              full_name: 'Demo User'
            }
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh'
          }
        },
        error: null
      }),
      signUp: ({ email, password, options }) => Promise.resolve({
        data: {
          user: {
            id: 'mock-user-id',
            email: email,
            user_metadata: options?.data || {}
          },
          session: null
        },
        error: null
      }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'demo@marketgenie.ai',
              user_metadata: {
                full_name: 'Demo User'
              }
            },
            access_token: 'mock-token',
            refresh_token: 'mock-refresh'
          }
        },
        error: null
      }),
      onAuthStateChange: (callback) => {
        // Mock auth state
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'mock-user-id',
              email: 'demo@marketgenie.ai',
              user_metadata: {
                full_name: 'Demo User'
              }
            }
          });
        }, 100);
        
        return {
          data: { subscription: { unsubscribe: () => {} } }
        };
      }
    }
  };
};

export const supabase = createMockClient();

// Helper functions for common operations
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getCurrentSession = () => {
  return supabase.auth.getSession()
}
