import * as React from "react";

export const NavigationRef: any = React.createRef();

const navigate = (name: string, params = null) => {
  NavigationRef.current?.navigate(name, params);
};

export default { navigate };
