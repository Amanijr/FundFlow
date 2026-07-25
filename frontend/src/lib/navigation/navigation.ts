import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Church,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Files,
  GraduationCap,
  HandCoins,
  Heart,
  History,
  Landmark,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Users,
  Wallet,
} from "lucide-react";

import type { NavGroup } from "@/types/navigation";

export const navigationGroups: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [
      {
        id: "executive-dashboard",
        label: "Executive",
        href: "/dashboard/executive",
        icon: LayoutDashboard,
        roles: ["ORG_ADMIN", "PROGRAM_MANAGER", "STAFF", "VIEW_ONLY", "AUDITOR"],
      },
      {
        id: "finance-dashboard",
        label: "Finance",
        href: "/dashboard/finance",
        icon: Wallet,
        roles: ["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT"],
      },
      {
        id: "fundraising-dashboard",
        label: "Fundraising",
        href: "/dashboard/fundraising",
        icon: HandCoins,
        roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER"],
      },
    ],
  },
  {
    id: "fundraising",
    label: "Fundraising",
    items: [
      { id: "donors", label: "Donors", href: "/donors", icon: Heart, roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"] },
      { id: "campaigns", label: "Campaigns", href: "/campaigns", icon: Target, roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"] },
      { id: "donations", label: "Donations", href: "/donations", icon: PiggyBank, roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"] },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { id: "funds", label: "Funds", href: "/funds", icon: Landmark, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT", "STAFF"] },
      { id: "budgets", label: "Budgets", href: "/budgets", icon: BarChart3, roles: ["ORG_ADMIN", "FINANCE_MANAGER"] },
      { id: "expenses", label: "Expenses", href: "/expenses", icon: Receipt, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"] },
      { id: "accounting", label: "Accounting", href: "/accounting/chart-of-accounts", icon: BookOpen, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT"] },
    ],
  },
  {
    id: "reporting",
    label: "Reporting",
    items: [
      { id: "reports", label: "Reports", href: "/reports", icon: LineChart, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "FUNDRAISING_MANAGER", "ACCOUNTANT", "PROGRAM_MANAGER", "STAFF", "AUDITOR", "VIEW_ONLY"] },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    items: [
      {
        id: "approvals",
        label: "Approvals",
        href: "/approvals",
        icon: ClipboardCheck,
        roles: ["ORG_ADMIN", "FINANCE_MANAGER", "FUNDRAISING_MANAGER", "PROGRAM_MANAGER", "STAFF", "ACCOUNTANT"],
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
        roles: ["ORG_ADMIN", "FINANCE_MANAGER", "FUNDRAISING_MANAGER", "PROGRAM_MANAGER", "STAFF", "ACCOUNTANT", "AUDITOR", "VIEW_ONLY"],
      },
      {
        id: "activity",
        label: "Activity",
        href: "/activity",
        icon: History,
        roles: ["ORG_ADMIN", "FINANCE_MANAGER", "FUNDRAISING_MANAGER", "PROGRAM_MANAGER", "STAFF", "ACCOUNTANT", "AUDITOR", "VIEW_ONLY"],
      },
      {
        id: "documents",
        label: "Documents",
        href: "/documents",
        icon: Files,
        roles: ["ORG_ADMIN", "FINANCE_MANAGER", "FUNDRAISING_MANAGER", "PROGRAM_MANAGER", "STAFF", "ACCOUNTANT", "AUDITOR", "VIEW_ONLY"],
      },
    ],
  },
  {
    id: "programs",
    label: "Programs",
    items: [
      { id: "programs", label: "Programs", href: "/programs", icon: FileText, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "PROGRAM_MANAGER"], organizationTypes: ["NGO", "FOUNDATION", "CHARITY", "COMMUNITY_ORGANIZATION", "SCHOOL"] },
      { id: "grants", label: "Grants", href: "/grants", icon: FileText, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "PROGRAM_MANAGER"], organizationTypes: ["NGO", "FOUNDATION", "CHARITY", "COMMUNITY_ORGANIZATION"] },
      { id: "beneficiaries", label: "Beneficiaries", href: "/beneficiaries", icon: Users, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "PROGRAM_MANAGER", "STAFF"], organizationTypes: ["NGO", "FOUNDATION", "CHARITY", "COMMUNITY_ORGANIZATION", "SCHOOL"] },
    ],
  },
  {
    id: "verticals",
    label: "Verticals",
    items: [
      { id: "church-ministries", label: "Ministries", href: "/church/ministries", icon: Church, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"], organizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"] },
      { id: "church-attendance", label: "Attendance", href: "/church/attendance", icon: ClipboardList, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"], organizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"] },
      { id: "school", label: "Sponsorships", href: "/school/sponsorships", icon: GraduationCap, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "PROGRAM_MANAGER", "STAFF"], organizationTypes: ["SCHOOL"] },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { id: "users", label: "Users", href: "/admin/users", icon: Users, roles: ["ORG_ADMIN"] },
      { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings, roles: ["ORG_ADMIN"] },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    items: [
      { id: "components", label: "Components", href: "/dev/components", icon: Building2, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "FUNDRAISING_MANAGER", "PROGRAM_MANAGER", "STAFF", "ACCOUNTANT"] },
      { id: "reference-list", label: "Reference list", href: "/dev/reference-list", icon: FileText, roles: ["ORG_ADMIN", "FINANCE_MANAGER", "FUNDRAISING_MANAGER", "PROGRAM_MANAGER", "STAFF", "ACCOUNTANT"] },
      { id: "reference-form", label: "Reference form", href: "/dev/reference-form", icon: FileText, roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"] },
    ],
  },
];
