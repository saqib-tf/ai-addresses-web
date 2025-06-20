// DTO for clientPrincipal JSON structure

export interface ClientPrincipalDto {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export interface LoggedInUserDto {
  clientPrincipal: ClientPrincipalDto;
}
