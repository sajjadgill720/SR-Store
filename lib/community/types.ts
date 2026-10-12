export interface Member { id: string; username: string; name: string; moderator: boolean }
export interface Activity { joined: string[]; saved: string[]; completed: string[]; notes: Record<string, string> }
export interface Thread { id: string; circle: string; title: string; body: string; author: string; authorId: string; createdAt: string; hidden: boolean }
export interface Reply { id: string; discussion: string; parentId: string | null; body: string; author: string; authorId: string; createdAt: string; hidden: boolean }
export const emptyActivity = (): Activity => ({ joined: [], saved: [], completed: [], notes: {} });
