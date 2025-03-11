export interface WebFingerLink {
  rel: string;
  href?: string;
  type?: string;
  titles?: Record<string, string>;
  properties?: Record<string, any>;
}

export interface WebFingerResponse {
  subject: string;
  aliases?: string[];
  properties?: Record<string, any>;
  links?: WebFingerLink[];
}