const normalizeDistance = (distanceMeters) => {
  if (distanceMeters === null || distanceMeters === undefined) {
    return 0.5;
  }
  const maxDistance = 50000;
  return Math.max(0, 1 - distanceMeters / maxDistance);
};

const normalizeRating = (rating = 0) => rating / 5;

export const rankServices = (services) =>
  services
    .map((service) => {
      const ratingScore = normalizeRating(service.provider.averageRating);
      const distanceScore = normalizeDistance(service.distanceMeters);
      const rankingScore = Number((ratingScore * 0.65 + distanceScore * 0.35).toFixed(4));

      return {
        ...service,
        rankingScore,
      };
    })
    .sort((a, b) => b.rankingScore - a.rankingScore);
