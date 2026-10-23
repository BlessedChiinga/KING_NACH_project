export type UserRole = 'host' | 'viewer';

export type PermissionLevel = 'view-only' | 'pointer-guidance' | 'full-control';

export interface RemotePointerEvent {
  type: 'move' | 'click' | 'dblclick' | 'mousedown' | 'mouseup' | 'scroll';
  x: number; // Normalized 0 to 1
  y: number; // Normalized 0 to 1
  button?: number; // 0: left, 1: middle, 2: right
  deltaY?: number;
  userId: string;
  userName: string;
  color: string;
}

export interface RemoteKeyEvent {
  type: 'keydown' | 'keyup' | 'shortcut';
  key: string;
  code?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  text?: string;
}

export interface RemoteLaserEvent {
  x: number;
  y: number;
  active: boolean;
  userId: string;
  color: string;
}

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface AnnotationStroke {
  id: string;
  points: AnnotationPoint[];
  color: string;
  width: number;
  userId: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: UserRole;
  text: string;
  timestamp: number;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  sender: string;
  timestamp: number;
}

export interface SessionStats {
  fps: number;
  latencyMs: number;
  bitrateMbps: number;
  resolution: string;
  packetLoss: number;
}

export interface SessionConfig {
  sessionId: string;
  hostName: string;
  pinRequired: boolean;
  pinCode: string;
  defaultPermission: PermissionLevel;
  allowClipboard: boolean;
  allowFileTransfer: boolean;
  allowAudio: boolean;
  createdAt: number;
}
