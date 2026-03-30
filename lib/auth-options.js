import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Authentication attempt:", { 
            email: credentials.email, 
            phone: credentials.phone 
          });

          if (!credentials?.password) {
            throw new Error("Password is required");
          }

          // ========== DEMO ACCOUNT BYPASS ==========
          // Demo account credentials for presentation
          const DEMO_ACCOUNTS = [
            {
              email: "demo@giftpocket.com",
              password: "Demo@123",
              user: {
                id: "demo_user_001",
                email: "demo@giftpocket.com",
                name: "Demo User",
                walletId: "GIFT78901234",
                hasVirtualAccount: true,
                balance: 150000,
                accountTier: "verified",
                kycStatus: "verified",
                phone: "08012345678",
                virtualAccountNumber: "9087123456",
                bankName: "Demo Bank PLC",
                isDemo: true
              }
            },
            {
              email: "presentation@giftpocket.com",
              password: "Presentation@123",
              user: {
                id: "demo_user_002",
                email: "presentation@giftpocket.com",
                name: "Presentation User",
                walletId: "GIFT12345678",
                hasVirtualAccount: true,
                balance: 250000,
                accountTier: "premium",
                kycStatus: "verified",
                phone: "08098765432",
                virtualAccountNumber: "9087987654",
                bankName: "Presentation Bank",
                isDemo: true
              }
            }
          ];

          // Check if credentials match demo accounts
          const demoAccount = DEMO_ACCOUNTS.find(
            account => account.email === credentials.email && 
                      account.password === credentials.password
          );

          if (demoAccount) {
            console.log("🎮 DEMO MODE: Authenticating demo user:", demoAccount.user.email);
            return demoAccount.user;
          }
          // ========== END DEMO ACCOUNT BYPASS ==========

          // Normal authentication flow for real users
          await connectDB();

          // Find user by email or phone
          let user;
          if (credentials.email) {
            user = await User.findOne({ 
              email: credentials.email.toLowerCase().trim() 
            });
          } else if (credentials.phone) {
            user = await User.findOne({ 
              phone: credentials.phone.trim() 
            });
          } else {
            throw new Error("Please provide email or phone");
          }

          if (!user) {
            throw new Error("No account found. Please register first.");
          }

          // Check if account is locked
          if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
            const lockTime = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
            throw new Error(`Account locked. Try again in ${lockTime} minutes.`);
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            // Track failed attempt
            await User.findByIdAndUpdate(user._id, {
              $inc: { failedLoginAttempts: 1 },
              $push: {
                loginHistory: {
                  ip: "",
                  userAgent: "",
                  timestamp: new Date(),
                  success: false
                }
              }
            });

            // Lock account after 5 failed attempts
            if (user.failedLoginAttempts + 1 >= 5) {
              await User.findByIdAndUpdate(user._id, {
                accountLockedUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
              });
              throw new Error("Account locked due to too many failed attempts.");
            }

            throw new Error("Incorrect password");
          }

          // Reset failed attempts on successful login
          await User.findByIdAndUpdate(user._id, {
            failedLoginAttempts: 0,
            accountLockedUntil: null,
            lastLogin: new Date(),
            $push: {
              loginHistory: {
                ip: "",
                userAgent: "",
                timestamp: new Date(),
                success: true
              }
            }
          });

          // Get wallet info
          const wallet = await Wallet.findOne({ userId: user._id });
          
          console.log("✅ Authentication successful for:", user.email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            walletId: user.walletId || wallet?.walletId,
            hasVirtualAccount: user.hasVirtualAccount || wallet?.virtualAccountStatus === "active",
            balance: user.balance || 0,
            accountTier: user.accountTier || "basic",
            kycStatus: user.kycStatus || "pending",
            phone: user.phone,
            virtualAccountNumber: user.virtualAccountNumber,
            bankName: user.bankName,
            isDemo: false
          };
        } catch (error) {
          console.error("Authentication error:", error.message);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.walletId = user.walletId;
        token.hasVirtualAccount = user.hasVirtualAccount;
        token.balance = user.balance || 0;
        token.accountTier = user.accountTier || "basic";
        token.kycStatus = user.kycStatus || "pending";
        token.phone = user.phone;
        token.virtualAccountNumber = user.virtualAccountNumber;
        token.bankName = user.bankName;
        token.isDemo = user.isDemo || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          walletId: token.walletId,
          hasVirtualAccount: token.hasVirtualAccount,
          balance: token.balance,
          accountTier: token.accountTier,
          kycStatus: token.kycStatus,
          phone: token.phone,
          virtualAccountNumber: token.virtualAccountNumber,
          bankName: token.bankName,
          isDemo: token.isDemo
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/dashboard";
    }
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };