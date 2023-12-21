/**
 * This module is used to choose a 'Leader' from a group of requester windows. This is useful
 * in the case when multiple requester windows are trying to perform an action that needs to be
 * done only once.
 *
 * In this case, the requester windows can ask this module to choose one as the `Leader` and only
 * that window can then be allowed to perform that action.
 */
var LeaderSelection = {
  leaderId: null,

  initialize () {
    try {
      LeaderSelection.leaderId = null;

      let requesterEventsChannel = pm.eventBus.channel('requester-window-events');

      requesterEventsChannel.subscribe((event = {}) => {
        // Case for window-closed event. It has the structure { type, windowId } and does
        // not follow the conventional event structure. So, adding a special case here.
        if (event.type === 'window-closed') {
          // If the the closed window ID is the same as the leaderId, we reset the leaderId
          // to null
          (event.windowId === LeaderSelection.leaderId) && LeaderSelection.setLeaderId(null);

          return;
        }

        // Case for other events in the requester-events namespace on the requester-window-events channel
        if (event.namespace !== 'requester-events' || event.name !== 'isWindowLeader') {
          return;
        }

        let isLeader = false,
          windowId = event.data && event.data.id,
          type = event.data && event.data.type;

        if (type === 'requester') {
          // A leader has not been selected yet. Set the current one as the leader
          if (!LeaderSelection.leaderId) {
            LeaderSelection.setLeaderId(windowId);
          }

          // If the leaderId is the same as the windowId, set isLeader to true
          if (LeaderSelection.leaderId === windowId) {
            isLeader = true;
          }
        }

        requesterEventsChannel.publish({
          name: 'isWindowLeaderReply',
          namespace: 'requester-events',
          data: {
            id: windowId,
            isLeader
          }
        });
      });

      pm.logger.info('LeaderSelection: Initialized successfully');
    }

    catch (e) {
      pm.logger.warn('LeaderSelection: Error while initializing', e);
    }

  },

  setLeaderId (id) {
    LeaderSelection.leaderId = id;
  }
};

module.exports = LeaderSelection;
