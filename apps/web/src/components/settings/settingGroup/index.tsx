import type React from 'react';

type IPropsType = {
	children: React.ReactNode;
};

export const settingGroup = ({ 
  children,
}: IPropsType) => {
  return <>{children}</>;
};
