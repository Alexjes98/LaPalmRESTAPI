const express = require("express");
const router = express.Router();
const {
  organizationController,
  organizationCensoController,
} = require("../controllers");

// Organization & Invitations management
router.post("/", organizationController.createOrganization);
router.get("/", organizationController.getUserOrganizations);
router.get("/invitations", organizationController.getPendingInvitations);
router.post(
  "/invitations/:memberId/respond",
  organizationController.respondToInvitation
);
router.get("/:orgId", organizationController.getOrganizationDetail);
router.put("/:orgId", organizationController.updateOrganization);
router.delete("/:orgId", organizationController.deleteOrganization);
router.post("/:orgId/invite", organizationController.inviteUser);
router.delete(
  "/:orgId/members/:userId",
  organizationController.removeMember
);

// Censo Pre Cosecha Lotes & Offline Sync for Organization
router.get("/:orgId/sync", organizationCensoController.syncOrganizationData);
router.post("/:orgId/lotes", organizationCensoController.createLote);
router.delete(
  "/:orgId/lotes/:code",
  organizationCensoController.deleteLote
);
router.post(
  "/:orgId/lotes/:code/censos",
  organizationCensoController.submitCensus
);
router.delete(
  "/:orgId/lotes/:code/censos/:dailyResultId",
  organizationCensoController.deleteDailyResult
);
router.post(
  "/:orgId/migrate",
  organizationCensoController.migrateLocalLotes
);

module.exports = router;

