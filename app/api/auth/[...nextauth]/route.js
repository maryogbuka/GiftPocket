// app/api/auth/[...nextauth]/route.js - Optimized
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          // Quick validation first
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          // Add a timeout to prevent hanging
          const authPromise = (async () => {
            try {
              // Rate limiting (only if it's fast)
              let rateLimitPassed = true;
              if (global.rateLimit) {
                try {
                  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
                  const limitKey = `auth:${ip}`;
                  const limitResult = await global.rateLimit.check(
                    limitKey,
                    5,
                    5 * 60 * 1000
                  );
                  rateLimitPassed = limitResult.allowed;
                } catch (rateLimitError) {
                  console.log("Rate limit check skipped:", rateLimitError.message);
                  // Continue without rate limiting if it fails
                }
              }

              if (!rateLimitPassed) {
                throw new Error('Too many login attempts. Please try again later.');
              }

              // Try to get user from database with timeout
              const { connectDB } = await import("../../../../lib/mongodb");
              const User = await import("../../../../models/User").then(m => m.default || m);
              
              await connectDB();
              
              // Find user (simplified query for speed)
              const user = await User.findOne({ 
                email: credentials.email.toLowerCase().trim() 
              });
              
              if (!user) {
                console.log("No user found");
                return null;
              }

              // Check if account is locked (quick check)
              if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
                throw new Error('Account is temporarily locked. Try again later.');
              }

              // Verify password
              const bcrypt = await import("bcrypt");
              const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password
              );

              if (!isPasswordValid) {
                console.log("Invalid password attempt");
                
                // Update failed attempts (non-blocking)
                User.findByIdAndUpdate(user._id, {
                  $inc: { failedLoginAttempts: 1 }
                }).catch(() => {});
                
                // Check if account should be locked
                if (user.failedLoginAttempts >= 4) { // 4 because we just incremented
                  User.findByIdAndUpdate(user._id, {
                    accountLockedUntil: new Date(Date.now() + 15 * 60 * 1000)
                  }).catch(() => {});
                  throw new Error('Too many failed attempts. Account locked for 15 minutes.');
                }
                
                return null;
              }

              // Reset failed attempts on success (non-blocking)
              User.findByIdAndUpdate(user._id, {
                failedLoginAttempts: 0,
                accountLockedUntil: null
              }).catch(() => {});

              // Record login (non-blocking)
              const userAgent = req.headers.get('user-agent') || 'unknown';
              const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
              
              // Successful login
              console.log(`Successful login: ${user.email}`);
              
              // Return essential user data only
              return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                walletId: user.walletId || `WLT${user._id.toString().slice(-6)}`,
                kycStatus: user.kycStatus || "pending",
                status: user.status || "active",
                role: user.role || 'user'
              };
              
            } catch (dbError) {
              console.error("Database auth error:", dbError.message);
              throw dbError;
            }
          })();

          // Set a timeout for the entire auth process
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Authentication timeout')), 5000);
          });

          return Promise.race([authPromise, timeoutPromise]);
          
        } catch (error) {
          console.error("Auth error:", error.message);
          
          // DEVELOPMENT FALLBACK - Only for specific credentials
          if (process.env.NODE_ENV === 'development' && 
              credentials?.email && 
              credentials?.password === "password123") {
            console.log("Development auth fallback");
            
            // Check if user exists in DB first
            try {
              const { connectDB } = await import("../../../../lib/mongodb");
              const User = await import("../../../../models/User").then(m => m.default || m);
              await connectDB();
              
              let user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
              
              if (user) {
                // Update user with dev data if missing
                if (!user.walletId) {
                  user.walletId = `DEVWLT${Date.now().toString().slice(-8)}`;
                  await user.save();
                }
                
                return {
                  id: user._id.toString(),
                  name: user.name,
                  email: user.email,
                  walletId: user.walletId,
                  kycStatus: user.kycStatus || "verified",
                  status: user.status || "active",
                  role: user.role || 'user'
                };
              }
              
              // Create new dev user
              const bcrypt = await import("bcrypt");
              const hashedPassword = await bcrypt.hash("password123", 10);
              
              const newUser = await User.create({
                name: credentials.email.split('@')[0] || "User",
                email: credentials.email.toLowerCase().trim(),
                password: hashedPassword,
                walletId: `DEVWLT${Date.now().toString().slice(-8)}`,
                kycStatus: "verified",
                status: "active",
                role: "user",
                failedLoginAttempts: 0
              });
              
              return {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
                walletId: newUser.walletId,
                kycStatus: newUser.kycStatus,
                status: newUser.status,
                role: newUser.role
              };
              
            } catch (fallbackError) {
              console.log("Dev fallback DB error, using pure dev auth");
              // Pure dev auth if DB fails
              return {
                id: `dev-${Date.now()}`,
                name: credentials.email.split('@')[0] || "User",
                email: credentials.email,
                walletId: `DEVWLT${Date.now().toString().slice(-8)}`,
                kycStatus: "verified",
                status: "active",
                role: "user"
              };
            }
          }
          
          // For production or other errors, return null
          return null;
        }
      }
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.walletId = user.walletId;
        token.kycStatus = user.kycStatus;
        token.role = user.role;
      }
      
      // Update token if session is updated (e.g., from dashboard)
      if (trigger === "update" && session?.user) {
        token.name = session.user.name || token.name;
        token.walletId = session.user.walletId || token.walletId;
        token.kycStatus = session.user.kycStatus || token.kycStatus;
        token.role = session.user.role || token.role;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Always ensure session has basic structure
      if (!session.user) session.user = {};
      
      if (token) {
        session.user.id = token.id || '';
        session.user.name = token.name || '';
        session.user.email = token.email || '';
        session.user.walletId = token.walletId || '';
        session.user.kycStatus = token.kycStatus || 'pending';
        session.user.role = token.role || 'user';
      }
      
      // Log session creation for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log("Session created/updated:", {
          hasUser: !!session.user,
          email: session.user?.email,
          hasWalletId: !!session.user?.walletId
        });
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Prioritize dashboard redirect
      if (url.includes('/dashboard')) return url;
      return `${baseUrl}/dashboard`;
    }
  },
  
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login?error=",
    newUser: "/register"
  },
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60 // Update session every hour
  },
  
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 // 24 hours
      }
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-change-in-production' : undefined),
  
  debug: process.env.NODE_ENV === 'development',
  
  // Optimize session updates
  useSecureCookies: process.env.NODE_ENV === "production",
  
  // Add event logging
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ token, session }) {
      console.log(`User signed out`);
    },
    async createUser({ user }) {
      console.log(`User created: ${user.email}`);
    },
    async updateUser({ user }) {
      console.log(`User updated: ${user.email}`);
    },
    async linkAccount({ user, account, profile }) {
      console.log(`Account linked for: ${user.email}`);
    },
    async session({ session, token }) {
      // Optional: Log session events
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };