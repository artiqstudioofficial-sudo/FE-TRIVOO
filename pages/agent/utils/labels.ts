import { AgentSpecialization } from '../../../types';

export function getAddLabel(spec?: AgentSpecialization) {
  switch (spec) {
    case AgentSpecialization.STAY:
      return 'List New Property';
    case AgentSpecialization.TRANSPORT:
      return 'Add Vehicle';
    default:
      return 'Create New Tour';
  }
}
