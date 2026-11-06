export type PeopleModule = "donors";

export function peopleBasePath(module: PeopleModule) {
  void module;
  return "/donors";
}

export function peopleApiBase(module: PeopleModule) {
  void module;
  return "/api/v1/donors";
}

export function peopleListPath(module: PeopleModule) {
  return peopleBasePath(module);
}

export function peopleNewPath(module: PeopleModule) {
  return `${peopleBasePath(module)}/new`;
}

export function personPath(module: PeopleModule, id: number) {
  return `${peopleBasePath(module)}/${id}`;
}

export function personEditPath(module: PeopleModule, id: number) {
  return `${peopleBasePath(module)}/${id}/edit`;
}
