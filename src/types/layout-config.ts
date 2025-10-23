// Layout configuration types for different template layouts

export interface HeaderLayoutConfig {
  type: 'centered' | 'horizontal';
  avatarPosition: 'center' | 'left';
  avatarSize: 'medium' | 'large';
  officerInfoPosition: 'center' | 'left';
  companyInfoPosition: 'center' | 'right';
  buttonsPosition: 'center' | 'right';
  spacing: {
    avatarToOfficer: number;
    officerToCompany: number;
    companyToButtons: number;
  };
}

export interface MainContentLayoutConfig {
  type: 'grid' | 'sidebar';
  sidebarPosition: 'right' | 'left';
  sidebarWidth: 'narrow' | 'wide';
  contentAreaWidth: 'full' | 'reduced';
}

export interface LayoutConfig {
  headerLayout: HeaderLayoutConfig;
  mainContentLayout: MainContentLayoutConfig;
}

// Default layout configurations
export const DEFAULT_CENTERED_LAYOUT: LayoutConfig = {
  headerLayout: {
    type: 'centered',
    avatarPosition: 'center',
    avatarSize: 'medium',
    officerInfoPosition: 'center',
    companyInfoPosition: 'center',
    buttonsPosition: 'center',
    spacing: {
      avatarToOfficer: 16,
      officerToCompany: 16,
      companyToButtons: 16
    }
  },
  mainContentLayout: {
    type: 'grid',
    sidebarPosition: 'right',
    sidebarWidth: 'narrow',
    contentAreaWidth: 'full'
  }
};

export const DEFAULT_HORIZONTAL_LAYOUT: LayoutConfig = {
  headerLayout: {
    type: 'horizontal',
    avatarPosition: 'left',
    avatarSize: 'large',
    officerInfoPosition: 'left',
    companyInfoPosition: 'center',
    buttonsPosition: 'right',
    spacing: {
      avatarToOfficer: 24,
      officerToCompany: 32,
      companyToButtons: 48
    }
  },
  mainContentLayout: {
    type: 'sidebar',
    sidebarPosition: 'left',
    sidebarWidth: 'wide',
    contentAreaWidth: 'reduced'
  }
};
