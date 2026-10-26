import { Building2, Car, HardHat, Heart, KeyRound, LucideIcon, Package, Scale, Store, Truck, Umbrella, Warehouse } from 'lucide-react-native';
import { View } from 'react-native';

import { PolicyType } from '@/lib/data';
import { colors } from '@/lib/theme';

import { TILE_TINT } from './policyModels';
import { PolicyTile3D, PolicyTileProps } from './PolicyTile3D';

/** Set to true to bring back the three.js models (PolicyTile3D / policyModels). */
const USE_3D = false;

const ICON: Record<PolicyType, { icon: LucideIcon; ink: string }> = {
  personalAuto: { icon: Car, ink: '#1F4FA8' },
  commercialAuto: { icon: Truck, ink: '#1F4FA8' },
  renters: { icon: KeyRound, ink: '#B4560F' },
  condo: { icon: Building2, ink: colors.goodInk },
  personalUmbrella: { icon: Umbrella, ink: colors.plum },
  commercialUmbrella: { icon: Umbrella, ink: colors.plum },
  generalLiability: { icon: Scale, ink: colors.gapInk },
  commercialProperty: { icon: Warehouse, ink: colors.goodInk },
  bop: { icon: Store, ink: '#B4560F' },
  workersComp: { icon: HardHat, ink: colors.warnInk },
  commercialPackage: { icon: Package, ink: '#3B7A1E' },
  termLife: { icon: Heart, ink: colors.gapInk },
};

/** The icon for a kind of policy: a flat line icon on a soft tinted tile. */
export function PolicyTile(props: PolicyTileProps) {
  if (USE_3D) return <PolicyTile3D {...props} />;

  const { type, size = 48, dim = false } = props;
  const { icon: Icon, ink } = ICON[type];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: dim ? colors.sunken : TILE_TINT[type],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.5} color={dim ? colors.muted : ink} strokeWidth={2} />
    </View>
  );
}
