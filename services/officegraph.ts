import { https, httpsGetAll } from "@/koksmat/httphelper"
import { Membership } from "./schemas"

export interface TransitiveMemberOf {
    "@odata.type": string
    id: string
    deletedDateTime: any
    description?: string
    displayName?: string
    roleTemplateId: any
    classification: any
    createdDateTime?: string
    creationOptions?: string[]
    expirationDateTime: any
    groupTypes?: string[]
    isAssignableToRole: any
    mail?: string
    mailEnabled?: boolean
    mailNickname?: string
    membershipRule?: string
    membershipRuleProcessingState?: string
    onPremisesDomainName?: string
    onPremisesLastSyncDateTime?: string
    onPremisesNetBiosName?: string
    onPremisesSamAccountName?: string
    onPremisesSecurityIdentifier?: string
    onPremisesSyncEnabled?: boolean
    preferredDataLocation: any
    preferredLanguage: any
    proxyAddresses?: string[]
    renewedDateTime?: string
    resourceBehaviorOptions?: string[]
    resourceProvisioningOptions?: string[]
    securityEnabled?: boolean
    securityIdentifier?: string
    theme: any
    visibility?: string
    onPremisesProvisioningErrors?: any[]
    serviceProvisioningErrors?: any[]
}
export interface Root<T> {
    "@odata.context": string;
    "@odata.count": number;
    "@microsoft.graph.tips": string;
    value: T[];
}
export async function getMemberOfs(accessToken: string) {
    const items = await httpsGetAll<TransitiveMemberOf>(accessToken,
        `https://graph.microsoft.com/v1.0/me/memberOf?$count=true`);

    const memberships = items.data?.map((item) => {

        const membership: Membership = {
            groupDisplayName: item.displayName ?? "",
            
            groupId: item.id,

        };
        return membership;

    });
    return memberships ?? [];
}


export interface SiteCollection {
    '@odata.context': string;
    createdDateTime: string;
    description: string;
    id: string;
    lastModifiedDateTime: string;
    name: string;
    webUrl: string;
    displayName: string;


}



export async function getSiteCollection(accessToken: string, sharePointTenantName: string, sitePath: string) {
    return https<SiteCollection>(accessToken ?? "", "GET", `https://graph.microsoft.com/v1.0/sites/${sharePointTenantName}.sharepoint.com:/${sitePath}`)
}


  
  export interface SitePage {
    '@odata.type': string;
    '@odata.etag': string;
    description?: string;
    eTag: string;
    id: string;
    lastModifiedDateTime: string;
    name: string;
    webUrl: string;
    title: string;
    pageLayout: string;
    thumbnailWebUrl: string;
    promotionKind: string;
    showComments: boolean;
    showRecommendedPages: boolean;
    contentType: ContentType;
    createdBy: CreatedBy;
    lastModifiedBy: LastModifiedBy;
    parentReference: ParentReference;
    publishingState: PublishingState;
    reactions: Reactions;
    titleArea?: TitleArea;
  }
  
  export interface TitleArea {
    enableGradientEffect: boolean;
    imageWebUrl: string;
    layout: string;
    showAuthor: boolean;
    showPublishedDate: boolean;
    showTextBlockAboveTitle: boolean;
    textAboveTitle: string;
    textAlignment: string;
    imageSourceType: number;
    title: string;
    'authors@odata.type': string;
    authors: Author[];
    'authorByline@odata.type': string;
    authorByline: string[];
    isDecorative: boolean;
    serverProcessedContent: ServerProcessedContent;
    hasTitleBeenCommitted?: boolean;
    altText?: string;
    webId?: string;
    siteId?: string;
    listId?: string;
    uniqueId?: string;
    translateX?: number;
    translateY?: number;
    imgHeight?: number;
    imgWidth?: number;
  }
  
  export interface ServerProcessedContent {
    htmlStrings: any[];
    searchablePlainTexts: any[];
    links: any[];
    imageSources: ImageSource[];
    customMetadata: CustomMetadatum[];
  }
  
  export interface CustomMetadatum {
    key: string;
    value: Value;
  }
  
  export interface Value {
    siteId?: string;
    webId?: string;
    listId?: string;
    uniqueId?: string;
    width?: number;
    height?: number;
  }
  
  export interface ImageSource {
    key: string;
    value: string;
  }
  
  export interface Author {
    id: string;
    upn: string;
    email: string;
    name: string;
    role: string;
  }
  
  export interface Reactions {
  }
  
  export interface PublishingState {
    level: string;
    versionId: string;
  }
  
  export interface ParentReference {
    siteId: string;
  }
  
  export interface LastModifiedBy {
    user: User2;
  }
  
  export interface User2 {
    displayName: string;
    email: string;
  }
  
  export interface CreatedBy {
    user: User;
  }
  
  export interface User {
    displayName: string;
    email?: string;
  }
  
  export interface ContentType {
    id: string;
    name: string;
  }
export async function getSitePages(accessToken: string, siteId: string) {
    return httpsGetAll<SitePage>(accessToken ?? "", `https://graph.microsoft.com/beta/sites/${siteId}/pages`)
}



