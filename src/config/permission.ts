/**

 * GLOBAL PERMISSION CONFIG (Optimized)

 * ---------------------------------------

 * - Fully type-safe

 * - Matches Prisma schema 100%

 * - Perfect for middleware, seeding, UI gating

 * - Easier to maintain long-term

 */



// --------------------------------------------------

// ACTION TYPES

// --------------------------------------------------

export const ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  RESPOND: "respond",
  ASSIGN: "assign",
} as const;



export type PermissionAction = typeof ACTIONS[keyof typeof ACTIONS];



// --------------------------------------------------

// MODULE DEFINITIONS

// --------------------------------------------------

export const MODULES = {

  DASHBOARD: "dashboard",

  ACTIVITY: "activity",

  ORGANIZATIONS: "organizations",



  PSYCHO_EDUCATION: "psycho.education",



  SELF_HELP: "selfhelp",

  SELF_HELP_JOURNALING: "selfhelp.journaling",

  SELF_HELP_MUSIC: "selfhelp.music",

  SELF_HELP_MEDITATION: "selfhelp.meditation",



  ANALYTICS: "analytics",

  USER_MANAGEMENT: "users",

  ESCALATIONS: "escalations",

  BADGES: "badges",

  SETTINGS: "settings",

  COUNSELOR_MANAGEMENT: "counselor.management",

  ACCESS_CONTROL: "access.control",

  CHAT_MONITOR: "chat.monitor",

  COUNSELING_SESSIONS: "counseling.sessions",

  CHALLENGES: "challenges",

} as const;



export type AppModule = typeof MODULES[keyof typeof MODULES];



// --------------------------------------------------

// PERMISSIONS MAP

// --------------------------------------------------

export const MODULE_PERMISSIONS: Record<AppModule, PermissionAction[]> = {

  [MODULES.DASHBOARD]: ["view"],

  [MODULES.ACTIVITY]: ["view"],



  [MODULES.ORGANIZATIONS]: ["view", "create", "update", "delete"],



  [MODULES.PSYCHO_EDUCATION]: ["view", "create", "update", "delete"],



  [MODULES.SELF_HELP]: ["view"],

  [MODULES.SELF_HELP_JOURNALING]: ["view", "update"],

  [MODULES.SELF_HELP_MUSIC]: ["view", "create", "update", "delete"],

  [MODULES.SELF_HELP_MEDITATION]: ["view", "create", "update", "delete"],



  [MODULES.ANALYTICS]: ["view"],



  [MODULES.USER_MANAGEMENT]: ["view", "create", "update", "delete"],



  [MODULES.ESCALATIONS]: ["view", "respond"],

  [MODULES.BADGES]: ["view", "assign"],

  [MODULES.SETTINGS]: ["view", "update"],

  [MODULES.COUNSELOR_MANAGEMENT]: ["view", "create", "update", "delete", "assign"],

  [MODULES.ACCESS_CONTROL]: ["manage"],

  [MODULES.CHAT_MONITOR]: ["view"],

  [MODULES.COUNSELING_SESSIONS]: ["view", "create", "update", "delete", "respond", "manage"],

  [MODULES.CHALLENGES]: ["view", "create", "update", "delete"],

};



// --------------------------------------------------

// FLATTEN PERMISSIONS FOR SEEDING

// --------------------------------------------------

export interface PermissionDefinition {

  module: AppModule;

  action: PermissionAction;

  key: string; // "module.action"

}



export const ALL_PERMISSIONS: PermissionDefinition[] =

  Object.entries(MODULE_PERMISSIONS).flatMap(([module, actions]) =>

    (actions as PermissionAction[]).map((action) => ({

      module: module as AppModule,

      action,

      key: `${module}.${action}`,

    }))

  );



// --------------------------------------------------

// ROLE PERMISSION GROUPS

// --------------------------------------------------

export const ROLE_PERMISSIONS = {

  SUPERADMIN: ALL_PERMISSIONS.map((p) => p.key),

  SCHOOL_SUPERADMIN: [
    "dashboard.view",
    "activity.view",

    "organizations.view",
    "organizations.update",

    "psycho.education.view",
    "psycho.education.create",
    "psycho.education.update",

    "selfhelp.view",

    "selfhelp.journaling.view",
    "selfhelp.journaling.update",

    "selfhelp.music.view",
    "selfhelp.music.create",
    "selfhelp.music.update",

    "selfhelp.meditation.view",
    "selfhelp.meditation.create",
    "selfhelp.meditation.update",

    "analytics.view",

    "users.view",
    "users.create",
    "users.update",

    "escalations.view",
    "escalations.respond",

    "badges.view",
    "badges.assign",

    "settings.view",
    "settings.update",

    "counselor.management.view",
    "counselor.management.create",
    "counselor.management.update",
    "counselor.management.delete",
    "counselor.management.assign",

    "counseling.sessions.view",
    "counseling.sessions.create",
    "counseling.sessions.update",
    "counseling.sessions.delete",
    "counseling.sessions.respond",
    "counseling.sessions.manage",
    "challenges.view",
    "challenges.create",
    "challenges.update",
    "challenges.delete",
  ],



  ADMIN: [

    "dashboard.view",

    "activity.view",



    "organizations.view",
    "organizations.update",

    "psycho.education.view",

    "psycho.education.create",

    "psycho.education.update",



    "selfhelp.view",



    "selfhelp.journaling.view",

    "selfhelp.journaling.update",



    "selfhelp.music.view",

    "selfhelp.music.create",

    "selfhelp.music.update",



    "selfhelp.meditation.view",

    "selfhelp.meditation.create",

    "selfhelp.meditation.update",



    "analytics.view",



    "users.view",

    "users.create",

    "users.update",



    "escalations.view",

    "escalations.respond",



    "badges.view",

    "badges.assign",



    "settings.view",

    "settings.update",

    "counselor.management.view",
    "counselor.management.create",
    "counselor.management.update",
    "counselor.management.assign",

    "counseling.sessions.view",
    "counseling.sessions.create",
    "counseling.sessions.respond",
    "challenges.view",
    "challenges.create",
    "challenges.update",

  ],



  COUNSELOR: [
    "dashboard.view",
    "escalations.view",
    "escalations.respond",
    "badges.view",
    "counseling.sessions.view",
    "counseling.sessions.create",
    "counseling.sessions.update",
    "counseling.sessions.respond",
    "challenges.view",
    "challenges.create",
    "challenges.update",
  ],

  PARENT: [
    "dashboard.view",
    "activity.view",
    "psycho.education.view",
    "selfhelp.view",
    "selfhelp.journaling.view",
    "selfhelp.music.view",
    "selfhelp.meditation.view",
    "badges.view",
    "escalations.view",
    "analytics.view",
    "users.view",
    "counseling.sessions.view",
    "counseling.sessions.create",
  ],

  STUDENT: [

    "dashboard.view",

    "activity.view",

    "counseling.sessions.view",



    "psycho.education.view",



    "selfhelp.view",

    "selfhelp.journaling.view",

    "selfhelp.music.view",

    "selfhelp.meditation.view",

    "challenges.view",



    "badges.view",

  ],

} as const;



// --------------------------------------------------

// HELPER: get permissions for role

// --------------------------------------------------

export const getRolePermissions = (roleName: keyof typeof ROLE_PERMISSIONS) =>

  new Set(ROLE_PERMISSIONS[roleName]);


