

// Backend base URL. Use REACT_APP_BETTING_API_URL (no trailing slash).
const bettingUrl = (process.env.REACT_APP_BETTING_API_URL || process.env.VITE_API_URL || "http://localhost:5008").replace(/\/$/, "");

export const deployedUrl = `${window.origin}/`;

export const ApiConfig = {
  // Sub-admin login: POST /api/v1/sub-admin/login (body: branchId+password OR branchName+password)
  subAdminLogin: `${bettingUrl}/api/v1/sub-admin/login`,
  // Sub-admin users: GET /api/v1/sub-admin/users?page=1&limit=20&search=
  subAdminUsers: `${bettingUrl}/api/v1/sub-admin/users`,
  // Sub-admin deposit details: POST /api/v1/sub-admin/deposit-details (body: type=bank, bankName, accountHolderName, accountNumber, ifscCode, displayOrder)
  subAdminDepositDetails: `${bettingUrl}/api/v1/sub-admin/deposit-details`,
  // Sub-admin UPI: POST /api/v1/sub-admin/deposit-details/upi (body: type=upi, upiId, upiName, qrImage?, minDeposit?, maxDeposit?, displayOrder)
  subAdminDepositDetailsUpi: `${bettingUrl}/api/v1/sub-admin/deposit-details/upi`,
  // Sub-admin deposit requests: GET .../deposit-requests, .../deposit-requests/pending, .../approved, .../rejected (optional ?page=&limit=)
  subAdminDepositRequests: `${bettingUrl}/api/v1/sub-admin/deposit-requests`,
  // Sub-admin dashboard: GET /api/v1/sub-admin/dashboard
  subAdminDashboard: `${bettingUrl}/api/v1/sub-admin/dashboard`,
  // Sub-admin withdrawal requests: GET .../withdrawal-requests, .../withdrawal-requests/pending|approved|rejected (optional ?page=&limit=); all: .../withdrawal-requests?status= optional
  subAdminWithdrawalRequests: `${bettingUrl}/api/v1/sub-admin/withdrawal-requests`,
  // Sub-admin collection, payout, profit/loss: GET /api/v1/sub-admin/collection-payout-profitloss
  subAdminCollectionPayoutProfitloss: `${bettingUrl}/api/v1/sub-admin/collection-payout-profitloss`,
  // Sub-admin approved transactions: GET /api/v1/sub-admin/approved-transactions (optional ?page=&limit=)
  subAdminApprovedTransactions: `${bettingUrl}/api/v1/sub-admin/approved-transactions`,
  // Sub-admin weekly settlement: GET /api/v1/sub-admin/weekly-settlement (single or list; optional ?page=&limit=)
  subAdminWeeklySettlement: `${bettingUrl}/api/v1/sub-admin/weekly-settlement`,

  // =========Betting Auth Endpoints==========
  bettingSendOtp: "send-otp",
  bettingRegister: "register",
  bettingLogin: "login",
  bettingRefreshToken: "refresh-token",
  bettingForgotPasswordSendOtp: "forgot-password/send-otp",
  bettingForgotPasswordReset: "forgot-password/reset", // body: mobile, otp, newPassword, confirmNewPassword
  bettingLogout: "logout",
  bettingLogoutAll: "logout-all",
  bettingChangePassword: "change-password",
  bettingGetMe: "me",
  bettingUpdateProfile: "profile",
  /** Send OTP for add bank account (same auth base as signup – POST /api/v1/auth/send-otp-bank) */
  bettingSendOtpBank: "send-otp-bank",

  // ============URLs================


  // ============Betting URLs================
  baseBettingAuth: `${bettingUrl}/api/v1/auth/`,
  baseBettingWallet: `${bettingUrl}/api/v1/wallet/`,
  baseBettingUrl: bettingUrl,
  bettingDepositOptions: "deposit-options",
  bettingDeposit: "deposit",
  bettingBalance: "balance",
  bettingDepositTransactions: "deposit-transactions",
  bettingWithdrawalTransactions: "withdrawal-transactions",
  bettingWithdrawal: "withdrawal",
  bettingSendWithdrawalOtp: "send-withdrawal-otp",
  /** GET /wallet/transactions/:id – single transaction (Section 2). */
  bettingWalletTransactions: "transactions",

  // Bank accounts (base + paths must match backend: POST /api/v1/bank-accounts/send-otp etc.)
  baseBettingBankAccounts: `${bettingUrl}/api/v1/bank-accounts`,
  bettingBankAccountsSendOtp: "send-otp",

  // Games (WCO – list, launch for iframe)
  baseBettingGames: `${bettingUrl}/api/v1/games/`,
  bettingGamesProviders: "providers",
  bettingGamesCategories: "categories",
  bettingGamesLaunch: "launch",
  bettingGamesLaunchSportsbook: "launch-sportsbook",
  bettingGamesFeatured: "featured",
  bettingGamesPopular: "popular",
  bettingGamesLanding: "landing",
  bettingGamesTransactions: "transactions",
  gamesSportsbookTransactions: "sportsbook/transactions",
  gamesSportsbookTransactionHistory: "sportsbook/transaction-history",

  // Sportsbook & Betting – base https://YOUR_API_HOST/api/v1/sportsbook (auth: Bearer token; socket namespace /sportsbook)
  baseBettingSportsbook: `${bettingUrl}/api/v1/sportsbook`,

  // User – master deposit accounts for /deposit page
  baseBettingUser: `${bettingUrl}/api/v1/user`,
  depositAccountsMaster: "deposit-accounts/master",

  // Support / Tickets (Section 7)
  baseBettingSupport: `${bettingUrl}/api/v1/support`,
  supportTickets: "tickets", // POST create, GET list. List: ?search=&status=&page=&limit=
  // GET tickets/:ticketId, POST tickets/:ticketId/messages, PATCH tickets/:ticketId/close

  // Referral (Section 5) – dashboard, balance, claim, referrals, referrals/export, profit, rewards/history, rewards/live, apply
  baseBettingReferral: `${bettingUrl}/api/v1/referral`,
  // Search (Section 6) – public; GET /search/trending?limit, GET /search?q= or ?query= & limit
  baseBettingSearch: `${bettingUrl}/api/v1/search`,

  // ============webSocketUrl================

};
